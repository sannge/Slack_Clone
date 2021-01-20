const { gql } = require("apollo-server-express");

module.exports = gql`
	type Error {
		path: String!
		message: String
	}
`;
