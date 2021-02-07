const { withFilter } = require("graphql-subscriptions");
const {
	requiresAuth,
	requiresTeamAccess,
	directMessageSubscription,
} = require("../util/permission");

const { Op } = require("sequelize");

const pubsub = require("../util/pubsub");

const NEW_DIRECT_MESSAGE = "NEW_DIRECT_MESSAGE";
const { s3 } = require("../util/aws-sdk");
const { v4 } = require("uuid");
const moment = require("moment");

module.exports = {
	DirectMessage: {
		// createdAt: (parent, args, { models }) => {
		// 	const time = moment(parent.createdAt).format("MMMM Do YYYY, h:mm:ss a");
		// 	return time;
		// },
		sender: ({ sender, senderId }, args, { models }) => {
			if (sender) {
				return sender;
			}
			return models.User.findOne({ where: { id: senderId }, raw: true });
		},
	},
	Query: {
		directMessages: requiresAuth.createResolver(
			async (_, { cursor, teamId, otherUserId }, { models, user }) => {
				try {
					cursor = parseInt(cursor);

					const options = {
						where: {
							teamId,
							[Op.or]: [
								{
									[Op.and]: [
										{
											receiverId: otherUserId,
										},
										{
											senderId: user.id,
										},
									],
								},
								{
									[Op.and]: [
										{
											receiverId: user.id,
										},
										{
											senderId: otherUserId,
										},
									],
								},
							],
						},
						// include: [{ model: models.User, as: "user" }],
						order: [["created_at", "DESC"]],
						limit: 35,
						include: "files",
					};

					if (cursor) {
						options.where.createdAt = {
							[Op.lt]: cursor,
						};
					}

					const messages = await models.DirectMessage.findAll(options);

					console.log("DIRECT MESSAGES: ", messages);

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
		createDirectMessage: requiresAuth.createResolver(
			async (_, args, { models, user }) => {
				//just return if no text for now
				console.log(args);

				// if (args.senderId === args.receiverId) {
				// 	return false;
				// }
				try {
					const message = await models.DirectMessage.create({
						receiverId: args.receiverId,
						text: args.text || null,
						teamId: args.teamId,
						senderId: user.id,
					});
					if (args.files && args.files.length > 0) {
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

							await models.DirectMessageFile.create(
								{
									url,
									directMessageId: message.id,
								}
								// { transaction }
							);

							// }
							// return m;
						}
					}

					console.log(message);

					pubsub.publish(NEW_DIRECT_MESSAGE, {
						teamId: args.teamId,
						senderId: user.id,
						receiverId: args.receiverId,
						newDirectMessage: {
							...message.dataValues,
							sender: {
								username: user.username,
							},
						},
					});
					return true;
				} catch (err) {
					console.log(err);
					return false;
				}
			}
		),
	},
	Subscription: {
		newDirectMessage: {
			subscribe: directMessageSubscription.createResolver(
				withFilter(
					// requiresAuth.createResolver(
					() => {
						return pubsub.asyncIterator(["NEW_DIRECT_MESSAGE"]);
					},

					// )
					(payload, args, { user }) => {
						return (
							payload.teamId === args.teamId &&
							((payload.senderId === user.id &&
								payload.receiverId === args.userId) ||
								(payload.senderId === args.userId &&
									payload.receiverId === user.id))
						);
					}
				)
			),
		},
	},
};
