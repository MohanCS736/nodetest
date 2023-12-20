const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const user = require("./users");

const favoriteDocumentsFolders = sequelize.define(
  "favourite_documents_folder",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      type: DataTypes.INTEGER,
      references: {
        model: user,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    folderName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }
);

favoriteDocumentsFolders.belongsTo(user);
user.hasMany(favoriteDocumentsFolders);

module.exports = favoriteDocumentsFolders;
