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

			this.hasMany(models.File, {
				as: "files",
				foreignKey: {
					name: "messageId",
					field: "message_id",
				},
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
			indexes: [{ fields: ["created_at"] }],
			//need to order the query by the index here
		}
	);
	return Message;
};
