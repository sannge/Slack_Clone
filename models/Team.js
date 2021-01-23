"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Team extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.belongsToMany(models.User, {
				through: "members",
				foreignKey: {
					name: "teamId",
					field: "team_id",
				},
			});

			this.belongsTo(models.User, {
				foreignKey: "owner",
			});
		}
	}
	Team.init(
		{
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			sequelize,
			tableName: "teams",
			modelName: "Team",
		}
	);
	return Team;
};
