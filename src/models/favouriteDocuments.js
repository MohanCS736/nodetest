const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const user = require("./users");
const resources = require("./resources");

const favoriteDocuments = sequelize.define("favourite_documents", {
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
  documentId: {
    type: DataTypes.INTEGER,
    references: {
      model: resources,
      key: "id",
    },
    onDelete: "CASCADE",
  },
});

favoriteDocuments.belongsTo(user, { foreignKey: "userId" });
user.hasMany(favoriteDocuments);
favoriteDocuments.belongsTo(resources, { foreignKey: "documentId" });
resources.hasMany(favoriteDocuments, { foreignKey: "documentId" });

module.exports = favoriteDocuments;
