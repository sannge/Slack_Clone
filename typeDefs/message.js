const { gql } = require("apollo-server-express");

module.exports = gql`
	scalar Upload
	type Message {
		id: Int!
		text: String
		files: [String]
		user: User!
		channel: Channel!
		createdAt: String!
	}

	type Query {
		getMessages(cursor: String, channelId: Int!): [Message!]!
	}

	type Mutation {
		createMessage(channelId: Int!, text: String, files: [Upload]): Boolean!
	}

	type Subscription {
		newChannelMessage(channelId: Int!): Message!
	}
`;
