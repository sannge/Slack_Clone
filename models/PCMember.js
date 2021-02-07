"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class PCMember extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
		}
	}
	PCMember.init(
		{},
		{
			sequelize,
			modelName: "PCMember",
			tableName: "pc_members",
		}
	);
	return PCMember;
};
