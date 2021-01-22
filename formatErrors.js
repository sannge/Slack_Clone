const _ = require("lodash");

exports.formatErrors = (e) => {
	if (e.name === "SequelizeValidationError") {
		return e.errors.map((x) => _.pick(x, ["path", "message"]));
	}
	return [{ path: "name", message: "something went wrong" }];
};
