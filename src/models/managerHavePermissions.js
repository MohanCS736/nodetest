const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const user = require("./users");
const documentLevel = require("./documentLevels");
const Permissions = require("./permissions");
const managerHavePermissions = sequelize.define("manager_Have_Permissions", {
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
  permissionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

managerHavePermissions.belongsTo(user, {
  foreignKey: "userId",
});

managerHavePermissions.belongsTo(Permissions, {
  foreignKey: "permissionId",
});

user.hasOne(managerHavePermissions);
module.exports = managerHavePermissions;
