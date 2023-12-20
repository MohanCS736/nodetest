const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const resources = require("./resources");
const user = require("./users");
const documentLevel = sequelize.define("document_level", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  level: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = documentLevel;
