const { tryLogin } = require("../auth");
const { formatErrors } = require("../formatErrors");

/*
 _.pick({a:1,b:2},'a') => {a:1}
*/

module.exports = {
	Query: {
		getUser: async (_, { id }, { models }) =>
			await models.User.findOne({ where: { id } }),

		allUsers: async (_, args, context) => {
			return await context.models.User.findAll();
		},
	},
	Mutation: {
		login: (_, { email, password }, { models, SECRET, SECRET2 }) => {
			return tryLogin(email, password, models, SECRET, SECRET2);
		},
		register: async (_, args, { models }) => {
			try {
				//hashing password inside sequelize hook afterValidate method
				// const hashedPassword = await bcrypt.hash(password, 12);
				const user = await models.User.create(args);
				if (user) {
					const firstTeam = await models.Team.create({
						name: `${args.username.toUpperCase()}_TEAM`,
						owner: user.id,
					});

					if (firstTeam) {
						const firstChannel = await models.Channel.create({
							name: "general",
							public: true,
							teamId: firstTeam.id,
						});
					}
				}
				return {
					ok: true,
					user,
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
