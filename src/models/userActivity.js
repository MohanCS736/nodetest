const sequelize = require('../config/db');
const {DataTypes} = require('sequelize');
const users = require('./users')
const userActivity = sequelize.define('users_activity',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    activityName:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    description:{
        type:DataTypes.TEXT,
        allowNull:false,
    },
    activityType:{
        type:DataTypes.ENUM,
        values: ['ERROR', 'INFO', 'DEBUG','NOTICE','WARNING','ALERT','CRITICAL','EMERGENCY','TIMEOUT'],
        allowNull:false,
    },
    takenBy:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    takenByRole:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    error:{
        type:DataTypes.TEXT,
        allowNull:true,
    },
});



module.exports = userActivity;
