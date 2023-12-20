const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const user = require("./users");

const managerAssignedStates = sequelize.define("manager_assigned_states", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: user,
      key: "id",
    },
    onDelete: "CASCADE",
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  states: {
    type: DataTypes.JSON,
    allowNull: false,
  },
});

managerAssignedStates.belongsTo(user, {
  foreignKey: "userId",
});

user.hasOne(managerAssignedStates, {
  foreignKey: "userId",
});

module.exports = managerAssignedStates;
