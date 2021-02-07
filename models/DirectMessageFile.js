"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class DirectMessageFile extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.belongsTo(models.DirectMessage, {
				foreignKey: {
					name: "directMessageId",
					field: "direct_message_id",
				},
			});
		}
	}
	DirectMessageFile.init(
		{
			url: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: "DirectMessageFile",
			tableName: "direct_message_files",
		}
	);
	return DirectMessageFile;
};
