const { formatErrors } = require("../formatErrors");
const { requiresAuth } = require("../util/permission");

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

					const response = models.sequelize.transaction(async (transaction) => {
						const channel = await models.Channel.create(args, { transaction });
						if (!args.public) {
							const members = args.members.filter((m) => m !== user.id);
							members.push(user.id);
							const pcmembers = members.map((m) => ({
								userId: m,
								channelId: channel.dataValues.id,
							}));
							await models.PCMember.bulkCreate(pcmembers, { transaction });
						}
						return channel;
					});

					return {
						ok: true,
						channel: response,
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
