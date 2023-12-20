const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const DocumentReportLogs = sequelize.define("document_report_logs", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  documentReportActivityId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
    // Denote the log row is the parent row or child row
  },
  activityType: {
    type: DataTypes.INTEGER,
    allowNull: true,
    // Denote the log type row is download, favourite, views
  },
  documentName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  documentDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  language: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  trainingType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resourceName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resourceDescription: {
    type: DataTypes.TEXT,
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
  averageWatchedTime: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

// DocumentReportLogs.belongsTo(DocumentReportActivities, {
//     foreignKey : 'documentReportActivityId',
// })

// DocumentReportActivities.hasMany(DocumentReportLogs,{
//     foreignKey : 'documentReportActivityId',
// })

module.exports = DocumentReportLogs;
