const { gql } = require("apollo-server-express");

module.exports = gql`
	type Channel {
		id: Int!
		name: String!
		public: Boolean!
		messages: [Message!]!
		users: [User!]!
	}
`;
