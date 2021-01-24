const { formatErrors } = require("../formatErrors");
const { requiresAuth } = require("../permission");

module.exports = {
	Query: {
		allTeams: requiresAuth.createResolver(async (_, args, { models, user }) => {
			try {
				const teams = await models.Team.findAll({
					where: { owner: user.id },
					raw: true,
				});
				console.log(teams);
				return teams;
			} catch (err) {
				console.log(err);
			}
		}),
	},
	Mutation: {
		createTeam: requiresAuth.createResolver(
			async (_, args, { models, user }) => {
				try {
					const team = await models.Team.create({ ...args, owner: user.id });
					await models.Channel.create({
						name: "general",
						public: true,
						teamId: team.id,
					});
					return {
						ok: true,
						team,
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
	Team: {
		channels: async ({ id }, args, { models, user }) => {
			return await models.Channel.findAll({ where: { teamId: id } });
		},
	},
};
