const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const user = require("./users");
const documentLevel = require("./documentLevels");
const managerHavePermissions = require("./managerHavePermissions");
const Permissions = sequelize.define("Permissions", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  PermissionsName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// user.hasOne(Permissions)
module.exports = Permissions;
