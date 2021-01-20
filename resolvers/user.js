const bcrypt = require("bcrypt");
const _ = require("lodash");

/*
 _.pick({a:1,b:2},'a') => {a:1}
*/

const formatErrors = (e) => {
	if (e.name === "SequelizeValidationError") {
		return e.errors.map((x) => _.pick(x, ["path", "message"]));
	}
	return [{ path: "name", message: "something went wrong" }];
};

module.exports = {
	Query: {
		getUser: async (_, { id }, { models }) =>
			await models.User.findOne({ where: { id } }),

		allUsers: async (_, args, { models }) => await models.User.findAll(),
	},
	Mutation: {
		register: async (_, { username, email, password }, { models }) => {
			if (password.length < 5 || password.length > 100) {
				return {
					ok: false,
					errors: [
						{
							path: "password",
							message:
								"The password needs to be between 5 and 100 characters long",
						},
					],
				};
			}
			try {
				const hashedPassword = await bcrypt.hash(password, 12);
				const user = await models.User.create({
					username,
					email,
					password: hashedPassword,
				});
				return {
					ok: true,
					user,
				};
			} catch (err) {
				return {
					ok: false,
					errors: formatErrors(err),
				};
			}
		},
	},
};
