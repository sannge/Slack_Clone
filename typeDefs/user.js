const { gql } = require("apollo-server-express");

module.exports = gql`
	type User {
		id: Int!
		email: String!
		username: String!
		teams: [Team!]!
	}

	type Query {
		getUser(id: Int!): User!
		allUsers: [User!]!
	}

	type RegisterResponse {
		ok: Boolean!
		user: User
		errors: [Error!]
	}

	type Mutation {
		register(
			username: String!
			email: String!
			password: String!
		): RegisterResponse!
	}
`;
