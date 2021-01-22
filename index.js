const express = require("express");
const bodyParser = require("body-parser");
const { ApolloServer } = require("apollo-server-express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
// import typeDefs from "./typeDefs";
// import resolvers from "./resolvers";
const db = require("./models");
const { refreshTokens } = require("./auth");

const path = require("path");
const {
	fileLoader,
	mergeTypes,
	mergeResolvers,
} = require("merge-graphql-schemas");
const { Console } = require("console");

const SECRET = "sadfqvoht21tesldfsfndslf";

const SECRET2 = "qwndbfqfg3g2ry329ytu2vgt3iquvg";

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, "./typeDefs")));

const resolvers = mergeResolvers(
	fileLoader(path.join(__dirname, "./resolvers"))
);

//started express server instance
const app = express();
app.use(cors("*"));

const addUser = async (req, res, next) => {
	const token = req.headers["x-token"];
	if (token) {
		try {
			const { user } = jwt.verify(token, SECRET);
			req.user = user;
			console.log("HAVE TOKEN!");
		} catch (err) {
			console.log("DONT HAVE TOKEN");
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
	typeDefs,
	resolvers,
	context: ({ req, res }) => {
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
