const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const documentDocument = sequelize.define("document_download_log", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  doc_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  favourite: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  downloads: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  comment: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});
module.exports = documentDocument;
