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
				through: models.Member,
				foreignKey: {
					name: "teamId",
					field: "team_id",
				},
			});
		}
	}
	Team.init(
		{
			name: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
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
