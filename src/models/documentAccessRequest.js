const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const resources = require("../models/resources");
const user = require("../models/users");
const documentAccessRequest = sequelize.define("document_access_requests", {
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
  documentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  requestedLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  approvalStatus: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  actionTakenBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});
documentAccessRequest.belongsTo(user, {
  foreignKey: "userId",
});
user.hasMany(documentAccessRequest);

documentAccessRequest.belongsTo(resources, {
  foreignKey: "documentId",
});

module.exports = documentAccessRequest;
