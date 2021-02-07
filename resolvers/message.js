const { withFilter } = require("graphql-subscriptions");
const path = require("path");
const { requiresAuth, requiresTeamAccess } = require("../util/permission");
const pubsub = require("../util/pubsub");
const { s3 } = require("../util/aws-sdk");
const { v4 } = require("uuid");
const { AuthenticationError } = require("apollo-server-express");
const moment = require("moment");
const { Op } = require("sequelize");

const NEW_CHANNEL_MESSGE = "NEW_CHANNEL_MESSGE";

module.exports = {
	Message: {
		// createdAt: (parent, args, { models }) => {
		// 	const time = moment(parent.createdAt).format("MMMM Do YYYY, h:mm:ss a");
		// 	return time;
		// },
		user: ({ user, userId }, args, { models }) => {
			if (user) {
				return user;
			}
			return models.User.findOne({ where: { id: userId }, raw: true });
		},
	},
	Query: {
		getMessages: requiresAuth.createResolver(
			async (_, { cursor, channelId }, { models, user }) => {
				cursor = parseInt(cursor);
				try {
					const channel = await models.Channel.findOne({
						raw: true,
						where: { id: channelId },
					});
					if (!channel.public) {
						const member = await models.PCMember.findOne({
							raw: true,
							where: { channelId, userId: user.id },
						});
						if (!member) {
							throw new Error("Not Authorized");
						}
					}

					const options = {
						where: { channelId },
						// include: [{ model: models.User, as: "user" }],
						order: [["created_at", "DESC"]],
						include: "files",
						limit: 35,
					};
					console.log(cursor);

					if (cursor) {
						options.where.createdAt = {
							[Op.lt]: cursor,
						};
					}

					const messages = await models.Message.findAll(options);
					let toReturnArr = [];
					messages.forEach((message) => toReturnArr.push(message.toJSON()));
					toReturnArr.forEach((message) => {
						message.file = [];
						message.files.forEach((file) => message.file.push(file.url));
					});

					toReturnArr.forEach((message) => {
						message.files = message.file;
						message.file = undefined;
					});

					return toReturnArr;
				} catch (err) {
					console.log(err);
				}
			}
		),
	},
	Mutation: {
		createMessage: requiresAuth.createResolver(
			async (_, args, { models, user }) => {
				if (args.files && args.files.length > 0) {
					try {
						// const message = models.sequelize.transaction(
						// async (transaction) => {
						console.log(args.files);
						const message = await models.Message.create(
							{
								channelId: args.channelId,
								text: args.text || null,
								userId: user.id,
							}
							// { transaction }
						);

						for (let i = 0; i < args.files.length; i++) {
							const file = args.files[i];

							const { createReadStream, mimetype } = await file;
							const ext =
								(mimetype.includes("/") && mimetype.split("/")[1]) || mimetype;
							const filenameToUpload = `${v4()}.${ext}`;
							console.log(filenameToUpload);

							const s3Response = await s3
								.upload({
									Bucket: process.env.AWS_BUCKET_NAME,
									Key: filenameToUpload,
									Body: createReadStream(),
								})
								.promise();
							const url = s3Response.Location;

							await models.File.create(
								{
									url,
									messageId: message.id,
								}
								// { transaction }
							);

							// }
							// return m;
						}
						// );

						const currentUser = await models.User.findOne({
							where: {
								id: user.id,
							},
						});

						pubsub.publish(NEW_CHANNEL_MESSGE, {
							channelId: args.channelId,
							newChannelMessage: {
								...message.dataValues,
								user: currentUser.dataValues,
							},
						});
						return true;
					} catch (err) {
						console.log(err);
						return false;
					}
				} else {
					try {
						console.log("here");
						const message = await models.Message.create({
							channelId: args.channelId,
							text: args.text || null,
							userId: user.id,
						});
						const currentUser = await models.User.findOne({
							where: {
								id: user.id,
							},
						});

						pubsub.publish(NEW_CHANNEL_MESSGE, {
							channelId: args.channelId,
							newChannelMessage: {
								...message.dataValues,
								user: currentUser.dataValues,
							},
						});
						return true;
					} catch (err) {
						console.log(err);
						return false;
					}
				}
			}
		),
	},
	Subscription: {
		newChannelMessage: {
			subscribe: requiresTeamAccess.createResolver(
				withFilter(
					// requiresAuth.createResolver(
					() => {
						return pubsub.asyncIterator(["NEW_CHANNEL_MESSGE"]);
					},

					// )
					(payload, args) => {
						console.log("from filter");
						return payload.channelId === args.channelId;
					}
				)
			),
		},
	},
};
