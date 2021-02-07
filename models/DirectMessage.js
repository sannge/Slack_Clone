"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class DirectMessage extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here

			this.belongsTo(models.Team, {
				foreignKey: {
					name: "teamId",
					field: "team_id",
				},
			});

			this.belongsTo(models.User, {
				foreignKey: {
					name: "receiverId",
					field: "receiver_id",
				},
			});

			this.belongsTo(models.User, {
				foreignKey: {
					name: "senderId",
					field: "sender_id",
				},
			});

			this.hasMany(models.DirectMessageFile, {
				as: "files",
				foreignKey: {
					name: "directMessageId",
					field: "direct_message_id",
				},
			});
		}
	}
	DirectMessage.init(
		{
			text: DataTypes.TEXT,
		},
		{
			sequelize,
			modelName: "DirectMessage",
			tableName: "direct_messages",
			indexes: [{ fields: ["created_at"] }],
		}
	);
	return DirectMessage;
};
