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

			this.belongsToMany(models.User, {
				through: models.PCMember,
				foreignKey: {
					name: "channelId",
					field: "channel_id",
				},
			});
		}
	}
	Channel.init(
		{
			name: {
				type: DataTypes.STRING,
				allowNull: false,
				required: true,
			},
			public: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
		},
		{
			sequelize,
			tableName: "channels",
			modelName: "Channel",
		}
	);
	return Channel;
};
