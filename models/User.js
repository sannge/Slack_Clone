"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.belongsToMany(models.Team, {
				through: "members",
				foreignKey: {
					name: "userId",
					field: "user_id",
				},
			});

			this.belongsToMany(models.Channel, {
				through: "channel_members",
				foreignKey: {
					name: "userId",
					field: "user_id",
				},
			});
		}
	}
	User.init(
		{
			username: {
				type: DataTypes.STRING,
			},
			email: {
				type: DataTypes.STRING,
				unique: true,
			},
			password: {
				type: DataTypes.STRING,
			},
		},
		{
			sequelize,
			tableName: "users",
			modelName: "User",
		}
	);

	return User;
};
