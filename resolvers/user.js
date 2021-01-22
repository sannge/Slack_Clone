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
