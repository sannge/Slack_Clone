const { formatErrors } = require("../formatErrors");
const { requiresAuth } = require("../permission");

module.exports = {
	Query: {},
	Mutation: {
		createChannel: requiresAuth.createResolver(
			async (_, args, { models, user }) => {
				console.log("ARGS: ", args);
				try {
					const member = await models.Member.findOne({
						where: { teamId: args.teamId, userId: user.id },
						raw: true,
					});
					if (!member.admin) {
						return {
							ok: false,
							errors: [
								{
									path: "name",
									message:
										"You have to be the owner of the team to creaete channels",
								},
							],
						};
					}
					const channel = await models.Channel.create({
						...args,
						public: true,
					});
					console.log(channel);
					return {
						ok: true,
						channel,
					};
				} catch (err) {
					console.log(err);
					return {
						ok: false,
						errors: formatErrors(err),
					};
				}
			}
		),
	},
};
