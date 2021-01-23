const { AuthenticationError } = require("apollo-server-express");

const createResolver = (resolver) => {
	const baseResolver = resolver;
	baseResolver.createResolver = (childResolver) => {
		const newResolver = async (parent, args, context, info) => {
			await resolver(parent, args, context, info);
			return childResolver(parent, args, context, info);
		};
		return createResolver(newResolver);
	};
	return baseResolver;
};

exports.requiresAuth = createResolver((parent, args, { user }) => {
	if (!user || !user.id) {
		throw new AuthenticationError("UNAUTHENTICATED");
	}
});

//REALLY POWERFUL AND CAN STACK THESE FOR CHECKING PERMISSIONS!!

// exports.requiresAdmin = requiresAuth.createResolver((parent, args, { user }) => {
// 	if (!user || !user.id) {
// 		throw new AuthenticationError("UNAUTHENTICATED");
// 	}
// });
