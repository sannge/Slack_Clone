const { gql } = require("apollo-server-express");

module.exports = gql`
	type Team {
		id: Int!
		name: String!
		directMessageMembers: [User!]
		channels: [Channel!]!
		admin: Boolean!
	}

	type CreateTeamResponse {
		ok: Boolean!
		team: Team
		errors: [Error!]
	}

	type VoidResponse {
		ok: Boolean!
		errors: [Error!]
	}

	type Query {
		allTeams: [Team!]!
		invitedTeams: [Team!]!
		getTeamMembers(teamId: Int!): [User!]!
	}

	type Mutation {
		createTeam(name: String!): CreateTeamResponse!
		addTeamMember(email: String!, teamId: Int!): VoidResponse!
	}
`;
