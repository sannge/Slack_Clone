const { gql } = require("apollo-server-express");

module.exports = gql`
	type Team {
		id: Int!
		owner: User!
		members: [User!]!
		channels: [Channel!]!
	}
`;
