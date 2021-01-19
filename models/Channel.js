"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Channel extends Model {
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

			this.belongsToMany(models.User, {
				through: "channel_members",
				foreignKey: {
					name: "channelId",
					field: "channel_id",
				},
			});
		}
	}
	Channel.init(
		{
			name: DataTypes.STRING,
			public: DataTypes.BOOLEAN,
		},
		{
			sequelize,
			tableName: "channels",
			modelName: "Channel",
		}
	);
	return Channel;
};
