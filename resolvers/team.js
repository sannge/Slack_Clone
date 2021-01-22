const { formatErrors } = require("../formatErrors");

module.exports = {
	Query: {},
	Mutation: {
		createTeam: async (_, args, { models, user }) => {
			try {
				const team = await models.Team.create({ ...args, owner: user.id });
				return {
					ok: true,
				};
			} catch (err) {
				console.log(err);
				return {
					ok: false,
					errors: formatErrors(err),
				};
			}
		},
	},
};
