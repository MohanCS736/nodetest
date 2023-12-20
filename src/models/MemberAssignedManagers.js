const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const users = require("./users");
const memberAssignedManager = sequelize.define("member_assigned_manager", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  assignedBy: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  assignedTo: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  assignedToUserRole: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  assignedManager: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
});
// users.hasOne(memberAssignedManager,{
//     foreignKey: 'assignedBy',
//     as:"assignBy"
// })
users.belongsToMany(users, {
  through: "member_assigned_manager" /* name of junction table */,
  foreignKey: "assignedManager" /* foreign key in junction table */,
  otherKey: "assignedTo",
  as: "assignMember" /*  */,
});
users.belongsToMany(users, {
  through: "member_assigned_manager" /* name of junction table */,
  foreignKey: "assignedTo" /* foreign key in junction table */,
  otherKey: "assignedManager",
  as: "member_manager" /*  */,
});
// const sequelize = require('../config/db');
// const { DataTypes } = require('sequelize');
// const userModel = require('./users');

// const assignManager = sequelize.define('assign_manager', {
//     // ... other fields
//     assignedby: {
//         type: DataTypes.BIGINT,
//         allowNull: true,
//         references: {
//             model: userModel, // The referenced model
//             key: 'id', // The referenced key
//         },
//     },
//     assignedTo: {
//         type: DataTypes.BIGINT,
//         allowNull: true,
//         references: {
//             model: userModel,
//             key: 'id',
//         },
//     },
//     assignedManager: {
//         type: DataTypes.BIGINT,
//         allowNull: true,
//         references: {
//             model: userModel,
//             key: 'id',
//         },
//     },
// });

// ... define associations as needed

module.exports = memberAssignedManager;
