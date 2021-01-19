module.exports = {
	Query: {
		getUser: async (_, { id }, { models }) =>
			await models.User.findOne({ where: { id } }),

		allUsers: async (_, args, { models }) => await models.User.findAll(),
	},
	Mutation: {
		createUser: async (_, args, { models }) => {
			try {
				const user = await models.User.create();
				return user.toJSON();
			} catch (err) {
				console.log(err);
				throw new Error(err);
			}
		},
	},
};
