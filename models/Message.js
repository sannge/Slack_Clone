"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Message extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.belongsTo(models.Channel, {
				foreignKey: {
					name: "channelId",
					field: "channel_id",
				},
			});

			this.belongsTo(models.User, {
				as: "user",
				foreignKey: "userId",
			});
		}
	}
	Message.init(
		{
			text: DataTypes.TEXT,
		},
		{
			sequelize,
			tableName: "messages",
			modelName: "Message",
		}
	);
	return Message;
};
