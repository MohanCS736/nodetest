const sequelize = require('../config/db');
const {DataTypes} = require('sequelize');
const users = require('./users')
const documents = require('./resources')
const userWatchedDocuments = sequelize.define('user_watched_documents',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    userId:{
        type:DataTypes.INTEGER,
    },
    documentId:{
        type:DataTypes.INTEGER,
    },
    documentType:{
        type:DataTypes.STRING,
    },
    documentWatchedTime:{
        type:DataTypes.TIME,
    },
    documentTotalTime:{
        type:DataTypes.TIME,
    }
});

userWatchedDocuments.belongsTo(users,{
    constraints: false,
    foreignKey:'userId'
});
userWatchedDocuments.belongsTo(documents,{
    constraints: false,
    foreignKey:'documentId'
});

users.hasMany(userWatchedDocuments,{
    constraints: false,
    foreignKey:'userId'
});
documents.hasMany(userWatchedDocuments,{
    constraints: false,
    foreignKey:'documentId'
});
module.exports = userWatchedDocuments