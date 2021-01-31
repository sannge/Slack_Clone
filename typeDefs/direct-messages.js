const { gql } = require("apollo-server-express");

module.exports = gql`
	type DirectMessage {
		id: Int!
		text: String!
		sender: User!
		receiver_id: Int!
	}
	type Query {
		DirectMessages: [DirectMessage!]!
	}
	type Mutation {
		createDirectMessage(receiver_id: Int!, texet: String!): Boolean!
	}
`;
