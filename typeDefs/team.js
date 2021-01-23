const { gql } = require("apollo-server-express");

module.exports = gql`
	type Team {
		id: Int!
		name: String!
		owner: User!
		members: [User!]!
		channels: [Channel!]!
	}

	type CreateTeamResponse {
		ok: Boolean!
		errors: [Error!]
	}

	type Query {
		allTeams: [Team!]!
	}

	type Mutation {
		createTeam(name: String!): CreateTeamResponse!
	}
`;
