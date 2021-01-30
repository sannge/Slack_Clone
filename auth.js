const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcrypt");

exports.createTokens = createTokens = (user, secret, secret2) => {
	const createToken = jwt.sign(
		{
			user: _.pick(user, ["id", "username"]),
		},
		secret,
		{
			expiresIn: "1h",
		}
	);

	const createRefreshToken = jwt.sign(
		{
			user: _.pick(user, "id"),
		},
		secret2,
		{
			expiresIn: "7d",
		}
	);

	return [createToken, createRefreshToken];
};

exports.refreshTokens = async (
	token,
	refreshToken,
	models,
	SECRET,
	SECRET2
) => {
	let userId = 0;
	try {
		const {
			user: { id },
		} = jwt.decode(refreshToken);
		userId = id;
	} catch (err) {
		return {};
	}

	if (!userId) {
		return {};
	}

	//{raw: true} so that we only get user object, not sequelize object that can be used to do operations
	const user = await models.User.findOne({ where: { id: userId }, raw: true });
	if (!user) {
		return {};
	}
	const refreshSecret = user.password + SECRET2;
	try {
		//make sure to use user.password+SECRET2 for secret
		jwt.verify(refreshToken, refreshSecret);
	} catch (err) {
		console.log("JET REFRESH TOKEN VERIFICATION ERROR:", err);
		return {};
	}

	const [newToken, newRefreshToken] = createTokens(user, SECRET, refreshSecret);

	return {
		user: user,
		token: newToken,
		refreshToken: newRefreshToken,
	};
};

exports.tryLogin = async (email, password, models, SECRET, SECRET2) => {
	const user = await models.User.findOne({ where: { email }, raw: true });
	if (!user) {
		// user with provided email not found
		return {
			ok: false,
			errors: [{ path: "email", message: "Valid Email is required" }],
		};
	}

	const valid = await bcrypt.compare(password, user.password);

	if (!valid) {
		// bad password
		return {
			ok: false,
			errors: [{ path: "password", message: "Valid Password is requried" }],
		};
	}

	const refreshTokenSecret = user.password + SECRET2;
	const [token, refreshToken] = createTokens(user, SECRET, refreshTokenSecret);

	return {
		ok: true,
		token,
		refreshToken,
	};
};
