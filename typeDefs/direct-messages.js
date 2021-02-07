const { gql } = require("apollo-server-express");

module.exports = gql`
	scalar Upload
	type DirectMessage {
		id: Int!
		text: String
		files: [String]
		sender: User!
		receiverId: Int!
		createdAt: String!
	}
	type Query {
		directMessages(
			cursor: String
			teamId: Int!
			otherUserId: Int!
		): [DirectMessage!]
	}
	type Mutation {
		createDirectMessage(
			receiverId: Int!
			text: String
			teamId: Int!
			files: [Upload]
		): Boolean!
	}
	type Subscription {
		newDirectMessage(teamId: Int!, userId: Int!): DirectMessage!
	}
`;
