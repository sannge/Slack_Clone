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
				allowNull: false,
				validate: {
					isAlphanumeric: {
						args: true,
						msg: "The username can only contain letters and numbers",
					},
					len: {
						args: [3, 25],
						msg: "The username needs to be between 3 and 25 characters long",
					},
				},
			},
			email: {
				type: DataTypes.STRING,
				unique: true,
				allowNull: false,
				validate: {
					isEmail: {
						args: true,
						msg: "Invalid Email",
					},
				},
			},
			password: {
				type: DataTypes.STRING,
				allowNull: false,
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
