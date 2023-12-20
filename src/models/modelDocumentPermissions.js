const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const user = require("./users");
const documentLevel = require("./documentLevels");
const modelsDocumentPermission = sequelize.define(
  "models_document_permission",
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
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    levelName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }
);
modelsDocumentPermission.belongsTo(documentLevel, {
  foreignKey: "level",
});
modelsDocumentPermission.belongsTo(user, {
  foreignKey: "userId",
});
user.hasOne(modelsDocumentPermission);
module.exports = modelsDocumentPermission;
