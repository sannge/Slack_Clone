const { gql } = require("apollo-server-express");

module.exports = gql`
	type Message {
		id: Int!
		text: String!
		user: User!
		channel: Channel!
		createdAt: String!
	}

	type Query {
		getMessages(channelId: Int!): [Message!]!
	}

	type Mutation {
		createMessage(channelId: Int!, text: String!): Boolean!
	}

	type Subscription {
		newChannelMessage(channelId: Int!): Message!
	}
`;
