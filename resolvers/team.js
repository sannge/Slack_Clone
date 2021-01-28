const { formatErrors } = require("../formatErrors");
const { requiresAuth } = require("../permission");
const { Op } = require("sequelize");

module.exports = {
	Query: {
		allTeams: requiresAuth.createResolver(async (_, args, { models, user }) => {
			try {
				const teams = await models.Team.findAll({
					where: {
						[Op.or]: [
							{
								owner: user.id,
							},
							{
								"$Users.id$": user.id,
							},
						],
					},
					include: [{ model: models.User }],
				});

				teams.forEach((t) => console.log("team: ", t.toJSON()));

				// console.log(teams);
				return teams;
			} catch (err) {
				console.log(err);
			}
		}),
		invitedTeams: requiresAuth.createResolver(
			async (_, args, { models, user }) => {
				try {
					const teams = await models.Team.findAll({
						include: [{ model: models.User, where: { id: user.id } }],
					});
					console.log(teams);
					return teams;
				} catch (err) {
					console.log(err);
				}
			}
		),
	},
	Mutation: {
		createTeam: requiresAuth.createResolver(
			async (_, args, { models, user }) => {
				try {
					//Sequelize transaction will wait for both to be created and then return
					//team to response. If one of them did not create, it will throw error, and roll back.
					const response = await models.sequelize.transaction(async () => {
						const team = await models.Team.create({ ...args, owner: user.id });
						await models.Channel.create({
							name: "general",
							public: true,
							teamId: team.id,
						});
						return team;
					});
					console.log(response);
					return {
						ok: true,
						team: response,
					};
				} catch (err) {
					console.log("ERORORROROROOROROROR: ", err);
					return {
						ok: false,
						errors: formatErrors(err),
					};
				}
			}
		),
		addTeamMember: requiresAuth.createResolver(
			async (_, { email, teamId }, { models, user }) => {
				try {
					// const owner = await models.User.findOne({
					// 	where: { id: user.id },
					// 	raw: true,
					// });
					console.log("USER: ", user);
					const teamPromise = models.Team.findOne({
						where: { id: teamId },
					});

					const invitedUserPromise = models.User.findOne({
						where: { email },
					});

					const [team, invitedUser] = await Promise.all([
						teamPromise,
						invitedUserPromise,
					]);

					if (team.owner !== user.id) {
						return {
							ok: false,
							errors: [
								{
									path: "email",
									message: "You cannot add members to the team",
								},
							],
						};
					}

					if (!invitedUser) {
						return {
							ok: false,
							errors: [
								{
									path: "email",
									message: "Could not find user with this email",
								},
							],
						};
					}

					if (invitedUser.id === user.id) {
						console.log("HAPPENED");
						return {
							ok: false,
							errors: [
								{
									path: "email",
									message: "You cannot add yourself as a member.",
								},
							],
						};
					}

					await team.addUser(invitedUser);

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
			}
		),
	},
	Team: {
		channels: async ({ id }, args, { models, user }) => {
			return await models.Channel.findAll({ where: { teamId: id } });
		},
	},
};
