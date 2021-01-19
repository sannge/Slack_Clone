const express = require("express");
const bodyParser = require("body-parser");
const { ApolloServer } = require("apollo-server-express");
const cors = require("cors");
// import typeDefs from "./typeDefs";
// import resolvers from "./resolvers";
const db = require("./models");

const path = require("path");
const {
	fileLoader,
	mergeTypes,
	mergeResolvers,
} = require("merge-graphql-schemas");

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, "./typeDefs")));

const resolvers = mergeResolvers(
	fileLoader(path.join(__dirname, "./resolvers"))
);

//started express server instance
const app = express();
app.use(cors("*"));

// create application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//started apollo instance
const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: {
		models: db,
		user: {
			id: 1,
		},
	},
});

//applid middleward app as server's middleward
server.applyMiddleware({ app: app });

db.sequelize
	.sync()
	.then(() => {
		app.listen(8080, () => {
			console.log(
				`🚀 Server ready at http://localhost:4000${server.graphqlPath}`
			);
			console.log("Database Connected!");
		});

		// sequelize
		// 	.authenticate()
		// 	.then(() => console.log("Database Connected!"))
		// 	.catch(() => console.log("Database Error Occured!"));
	})
	.catch((err) => console.log(err));
