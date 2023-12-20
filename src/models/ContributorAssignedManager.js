const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const users = require("./users");
const assignManager = sequelize.define("Contributor_assigned_manager", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  assignedBy: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  assignedTo: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  assignedToUserRole: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  assignedManager: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
});
// users.hasOne(assignManager,{
//     foreignKey: 'assignedBy',
//     as:"assignBy"
// })
users.belongsToMany(users, {
  through: "Contributor_assigned_manager" /* name of junction table */,
  foreignKey: "assignedManager" /* foreign key in junction table */,
  otherKey: "assignedTo",
  as: "assignUser" /*  */,
});
users.belongsToMany(users, {
  through: "Contributor_assigned_manager" /* name of junction table */,
  foreignKey: "assignedTo" /* foreign key in junction table */,
  otherKey: "assignedManager",
  as: "manager" /*  */,
});

module.exports = assignManager;
