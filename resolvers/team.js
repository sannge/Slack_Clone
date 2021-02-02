const { formatErrors } = require("../formatErrors");
const { requiresAuth } = require("../permission");
const { Op } = require("sequelize");

module.exports = {
	Query: {
		getTeamMembers: requiresAuth.createResolver(
			async (_, { teamId }, { user, models }) => {
				console.log("hi");
				const teamMembers = models.User.findAll({
					include: [{ model: models.Team, as: "teams", where: { id: teamId } }],
				});
				return teamMembers;
			}
		),
	},
	Mutation: {
		createTeam: requiresAuth.createResolver(
			async (_, args, { models, user }) => {
				try {
					//Sequelize transaction will wait for both to be created and then return
					//team to response. If one of them did not create, it will throw error, and roll back.
					const response = await models.sequelize.transaction(
						async (transaction) => {
							const team = await models.Team.create(
								{ ...args },
								{ transaction }
							);
							await models.Channel.create(
								{
									name: "general",
									public: true,
									teamId: team.id,
								},
								{ transaction }
							);
							await models.Member.create(
								{
									teamId: team.id,
									userId: user.id,
									admin: true,
								},
								{ transaction }
							);
							return team;
						}
					);
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
					const memberPromise = models.Member.findOne({
						where: { teamId, userId: user.id },
					});

					const invitedUserPromise = models.User.findOne({
						where: { email },
					});

					const [member, invitedUser] = await Promise.all([
						memberPromise,
						invitedUserPromise,
					]);

					if (!member.admin) {
						return {
							ok: false,
							errors: [
								{
									path: "email",
									message: "You are not the admin of the team",
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

					await models.Member.create({ userId: invitedUser.id, teamId });

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
		directMessageMembers: async ({ id }, args, { models, user }) => {
			const response = await models.sequelize.query(
				"select distinct on (u.id) u.id, u.username from users as u join direct_messages as dm on (u.id = dm.sender_id) or (u.id = dm.receiver_id) where (:currentUserId = dm.sender_id or :currentUserId = dm.receiver_id) and dm.team_id = :teamId",
				{
					replacements: { currentUserId: user.id, teamId: id },
					model: models.User,
					raw: true,
				}
			);
			return response;
		},
	},
};
