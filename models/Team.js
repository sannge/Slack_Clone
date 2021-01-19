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

			Team.belongsTo(models.User, {
				foreignKey: "owner",
			});
		}
	}
	Team.init(
		{
			name: DataTypes.STRING,
		},
		{
			sequelize,
			tableName: "teams",
			modelName: "Team",
		}
	);
	return Team;
};
