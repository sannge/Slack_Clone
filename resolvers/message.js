const { AuthenticationError } = require("apollo-server-express");
const { PubSub, withFilter } = require("graphql-subscriptions");
const { requiresAuth } = require("../permission");

const pubsub = new PubSub();

const NEW_CHANNEL_MESSGE = "NEW_CHANNEL_MESSGE";

module.exports = {
	Message: {
		createdAt: (parent, args, { models }) => parent.createdAt.toISOString(),
		user: ({ user, userId }, args, { models }) => {
			if (user) {
				return user;
			}
			return models.User.findOne({ where: { id: userId }, raw: true });
		},
	},
	Query: {
		getMessages: requiresAuth.createResolver(
			async (_, { channelId }, { models, user }) => {
				try {
					const messages = await models.Message.findAll({
						where: { channelId },
						// include: [{ model: models.User, as: "user" }],
						order: [["created_at", "ASC"]],
						raw: true,
					});
					return messages;
				} catch (err) {
					console.log(err);
				}
			}
		),
	},
	Mutation: {
		createMessage: requiresAuth.createResolver(
			async (_, args, { models, user }) => {
				{
					try {
						const message = await models.Message.create({
							...args,
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
			subscribe: withFilter(
				// requiresAuth.createResolver(
				requiresAuth.createResolver((_, { channelId }, { models, user }) => {
					//check if part of the team
					// const channel = await models.Channel.findOne({
					// 	where: { id: channelId },
					// });
					// const member = await models.Member.findOne({
					// 	where: {
					// 		teamId: channel.teamId,
					// 		userId: user.id,
					// 	},
					// });
					// if (!member) {
					// 	throw new AuthenticationError(
					// 		"You have to be a member of the team to subscribe to it's messages"
					// 	);
					// }
					return pubsub.asyncIterator(["NEW_CHANNEL_MESSGE"]);
				}),
				// )
				(payload, args) => {
					console.log("from filter");
					return payload.channelId === args.channelId;
				}
			),
		},
	},
};
