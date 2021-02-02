const { tryLogin } = require("../auth");
const { formatErrors } = require("../formatErrors");
const { requiresAuth } = require("../permission");

/*
 _.pick({a:1,b:2},'a') => {a:1}
*/

module.exports = {
	// User: {
	// 	teams: (parent, args, { models, user }) => {
	// 		return models.sequelize.query(
	// 			"select * from teams as team join members as member on team.id=member.team_id where member.user_id=?",
	// 			{
	// 				replacements: [user.id],
	// 				model: models.Team,
	// 				raw: true,
	// 			}
	// 		);
	// 	},
	// },
	Query: {
		allUsers: async (_, args, context) => {
			return await context.models.User.findAll();
		},
		me: requiresAuth.createResolver(async (_, __, { models, user }) => {
			const response = await models.User.findOne({
				where: { id: user.id },
				include: [{ model: models.Team, as: "teams" }],
			});
			response.teams.forEach((team) => (team.admin = team.Member.admin));

			return response;
		}),
		getUser: async (_, { userId }, { models, user }) => {
			return await models.User.findOne({ where: { id: userId } });
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
					// const firstTeam = await models.Team.create({
					// 	name: `${args.username.toUpperCase()}_TEAM`,
					// });

					// if (firstTeam) {
					// 	const firstChannel = await models.Channel.create({
					// 		name: "general",
					// 		public: true,
					// 		teamId: firstTeam.id,
					// 	});

					// 	if(firstChannel) {

					// 	}
					// }
					const response = await models.sequelize.transaction(async () => {
						const team = await models.Team.create({
							name: `${args.username.toUpperCase()}_TEAM`,
						});
						await models.Channel.create({
							name: "general",
							public: true,
							teamId: team.id,
						});
						await models.Member.create({
							teamId: team.id,
							userId: user.id,
							admin: true,
						});
						return team;
					});
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
