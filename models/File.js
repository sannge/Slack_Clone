"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class File extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.belongsTo(models.Message, {
				foreignKey: {
					name: "messageId",
					field: "message_id",
				},
			});
		}
	}
	File.init(
		{
			url: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: "File",
			tableName: "files",
		}
	);
	return File;
};
