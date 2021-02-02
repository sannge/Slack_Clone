const { withFilter } = require("graphql-subscriptions");
const {
	requiresAuth,
	requiresTeamAccess,
	directMessageSubscription,
} = require("../permission");

const { Op } = require("sequelize");

const pubsub = require("../pubsub");

const NEW_DIRECT_MESSAGE = "NEW_DIRECT_MESSAGE";

module.exports = {
	DirectMessage: {
		createdAt: (parent, args, { models }) => parent.createdAt.toISOString(),
		sender: ({ sender, senderId }, args, { models }) => {
			if (sender) {
				return sender;
			}
			return models.User.findOne({ where: { id: senderId }, raw: true });
		},
	},
	Query: {
		directMessages: requiresAuth.createResolver(
			async (_, { teamId, otherUserId }, { models, user }) => {
				try {
					const messages = await models.DirectMessage.findAll({
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
		createDirectMessage: requiresAuth.createResolver(
			async (_, args, { models, user }) => {
				console.log("ARGS: ", args);
				if (args.senderId === args.receiverId) {
					return false;
				}
				try {
					const message = await models.DirectMessage.create({
						...args,
						senderId: user.id,
					});

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
