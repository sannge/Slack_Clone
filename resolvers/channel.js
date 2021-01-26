const { formatErrors } = require("../formatErrors");
module.exports = {
	Query: {},
	Mutation: {
		createChannel: async (_, args, { models }) => {
			console.log("ARGS: ", args);
			try {
				const channel = await models.Channel.create({ ...args, public: true });
				console.log(channel);
				return {
					ok: true,
					channel,
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
