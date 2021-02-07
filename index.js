const express = require("express");
const bodyParser = require("body-parser");
const {
	ApolloServer,
	gql,
	AuthenticationError,
} = require("apollo-server-express");
require("dotenv/config");
const { createServer } = require("http");
const { execute, subscribe } = require("graphql");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { SubscriptionServer } = require("subscriptions-transport-ws");
const db = require("./models");
const { refreshTokens } = require("./auth");
const { makeExecutableSchema } = require("graphql-tools");

const path = require("path");
const {
	fileLoader,
	mergeTypes,
	mergeResolvers,
} = require("merge-graphql-schemas");

const SECRET = "sadfqvoht21tesldfsfndslf";

const SECRET2 = "qwndbfqfg3g2ry329ytu2vgt3iquvg";

const PORT = process.env.PORT || 8080;

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, "./typeDefs")));

const resolvers = mergeResolvers(
	fileLoader(path.join(__dirname, "./resolvers"))
);

//created a schema for websocket server
const schema = makeExecutableSchema({
	typeDefs,
	resolvers,
});

//started express server instance
const app = express();
app.use(cors("*"));

const addUser = async (req, res, next) => {
	const token = req.headers["x-token"];
	if (token) {
		try {
			const { user } = jwt.verify(token, SECRET);
			req.user = user;
		} catch (err) {
			const refreshToken = req.headers["x-refresh-token"];

			const newTokens = await refreshTokens(
				token,
				refreshToken,
				db,
				SECRET,
				SECRET2
			);

			if (newTokens.token && newTokens.refreshToken) {
				res.set("Access-Control-Expose-Headers", "*");
				res.set("x-token", newTokens.token);
				res.set("x-refresh-token", newTokens.refreshToken);
			}
			req.user = newTokens.user;
		}
	}
	next();
};

app.use(addUser);

// create application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//started apollo instance
const server = new ApolloServer({
	schema,
	context: ({ req, res, connection }) => {
		return {
			models: db,
			user: req.user,
			SECRET,
			SECRET2,
		};
	},
});

//applid middleward app as server's middleward
server.applyMiddleware({ app: app });

//create http server, and instead of calling app.listen(), go for wsServer.listen()
//to instantiate new SubscriptionServer too.
const withWSServer = createServer(app);

db.sequelize
	.sync()
	.then(() => {
		withWSServer.listen(PORT, () => {
			console.log(`🚀 Server ready at ${PORT}`);
			console.log("Database Connected!");
			//if the server is created, then create subscription server within it,
			//with the path /subscriptions.
			new SubscriptionServer(
				{
					execute,
					subscribe,
					schema,
					//for web socket authentication!!!!!!!!
					onConnect: async ({ token, refreshToken }, webSocket) => {
						if (token && refreshToken) {
							try {
								const { user } = jwt.verify(token, SECRET);
								return { models: db, user };
							} catch (err) {
								const newTokens = await refreshTokens(
									token,
									refreshToken,
									db,
									SECRET,
									SECRET2
								);
								return { models: db, user: newTokens.user };
							}
						}
						return {};
					},
				},
				{
					server: withWSServer,
					path: "/graphql",
				}
			);
		});

		// sequelize
		// 	.authenticate()
		// 	.then(() => console.log("Database Connected!"))
		// 	.catch(() => console.log("Database Error Occured!"));
	})
	.catch((err) => console.log(err));
