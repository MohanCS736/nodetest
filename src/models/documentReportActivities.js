const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const DocumentReportLogs = require("./documentReportLogs");

const DocumentReportActivities = sequelize.define(
  "document_report_activities",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    documentReportId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
      // Denote the activity row is the parent row or child row  2 is parent row and 3 is child row
    },
    activityType: {
      type: DataTypes.STRING,
      allowNull: true,
      // Denote the activity type row is download 22 , favourite 23, views 24
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    favourites: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    downloads: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    views: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    finish: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }
);

DocumentReportActivities.belongsTo(DocumentReportLogs, {
    foreignKey : 'documentReportId',
    constraints: false
})

DocumentReportLogs.belongsTo(DocumentReportActivities, {
    foreignKey : 'documentReportActivityId',
    constraints: false
})

// DocumentReportActivities.belongsTo(DocumentReportLogs, {
//     foreignKey : 'documentReportId',
// })

// DocumentReportLogs.hasMany(DocumentReportActivities,{
//     foreignKey : 'documentReportId',
// })
module.exports = DocumentReportActivities;
