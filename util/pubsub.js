const { PubSub } = require("apollo-server-express");
const { RedisPubSub } = require("graphql-redis-subscriptions");

const pubsub = new RedisPubSub({
	connection: {
		host: "127.0.0.1",
		port: 6379,
		retryStrategy: (options) => {
			return Math.max(options.attempt * 100, 3000);
		},
	},
});

module.exports = pubsub;
