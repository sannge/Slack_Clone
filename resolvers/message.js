module.exports = {
	Query: {},
	Mutation: {
		createMessage: async (_, args, { models, user }) => {
			{
				try {
					const team = await models.Message.create({
						...args,
						userId: user.id,
					});
					return true;
				} catch (err) {
					console.log(err);
					return false;
				}
			}
		},
	},
};
