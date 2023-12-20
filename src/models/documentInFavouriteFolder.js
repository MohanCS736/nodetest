const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const favoriteDocumentsFolders = require("./favouriteDocumentsFolder");
const favoriteDocuments = require("./favouriteDocuments");

const documentsInFavouriteFolder = sequelize.define(
  "document_in_favourie_folder",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    folderId: {
      type: DataTypes.INTEGER,
      references: {
        model: favoriteDocumentsFolders,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    favouriteId: {
      type: DataTypes.INTEGER,
      references: {
        model: favoriteDocuments,
        key: "id",
      },
      onDelete: "CASCADE",
    },
  }
);

documentsInFavouriteFolder.belongsTo(favoriteDocumentsFolders, {
  foreignKey: "folderId",
});
documentsInFavouriteFolder.belongsTo(favoriteDocuments, {
  foreignKey: "favouriteId",
});

favoriteDocuments.hasMany(documentsInFavouriteFolder, {
  foreignKey: "favouriteId",
});
module.exports = documentsInFavouriteFolder;
