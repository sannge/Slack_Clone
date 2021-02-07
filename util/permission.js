const { AuthenticationError } = require("apollo-server-express");
const { Op } = require("sequelize");

const createResolver = (resolver) => {
	const baseResolver = resolver;
	baseResolver.createResolver = (childResolver) => {
		const newResolver = async (parent, args, context, info) => {
			await resolver(parent, args, context, info);
			return childResolver(parent, args, context, info);
		};
		return createResolver(newResolver);
	};
	return baseResolver;
};

exports.requiresAuth = createResolver((parent, args, { user }) => {
	if (!user || !user.id) {
		throw new AuthenticationError("UNAUTHENTICATED");
	}
});

exports.requiresTeamAccess = createResolver(
	async (parent, { channelId }, { user, models }) => {
		if (!user || !user.id) {
			throw new AuthenticationError("UNAUTHENTICATED");
		}
		const channel = await models.Channel.findOne({
			where: { id: channelId },
		});
		const member = await models.Member.findOne({
			where: {
				userId: user.id,
				teamId: channel.teamId,
			},
		});
		if (!member) {
			throw new AuthenticationError(
				"You have to be a member of the team to subscribe to it's messages"
			);
		}
	}
);

exports.directMessageSubscription = createResolver(
	async (parent, { teamId, userId }, { user, models }) => {
		if (!user || !user.id) {
			throw new AuthenticationError("UNAUTHENTICATED");
		}

		const members = await models.Member.findAll({
			where: {
				teamId,
				[Op.or]: [
					{
						userId: user.id,
					},
					{ userId: userId },
				],
			},
			raw: true,
		});
		if (members.length !== 2) {
			throw new AuthenticationError("Something Went Wrong");
		}
	}
);

//REALLY POWERFUL AND CAN STACK THESE FOR CHECKING PERMISSIONS!!

// exports.requiresAdmin = requiresAuth.createResolver((parent, args, { user }) => {
// 	if (!user || !user.id) {
// 		throw new AuthenticationError("UNAUTHENTICATED");
// 	}
// });
