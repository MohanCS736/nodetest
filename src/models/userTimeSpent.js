const sequelize = require('../config/db');
const {DataTypes} = require('sequelize');
const users = require('./users');

const userTimeSpent = sequelize.define('user_time_spent',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    userId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    date:{
        type:DataTypes.DATEONLY,
        allowNull:false
    },
    startTime:{
        type:DataTypes.TIME,
        allowNull:true
    },
    endTime: {
        type:DataTypes.TIME,
        allowNull:true
    },
    totalTimeSpent: {
        type:DataTypes.INTEGER,
        allowNull:true
    }

});

userTimeSpent.belongsTo(users, {
    foreignKey: "userId",
    as: "rowBy",
    constraints: false,
  });

module.exports = userTimeSpent;