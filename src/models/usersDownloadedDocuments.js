const sequelize = require('../config/db');
const {DataTypes} = require('sequelize');

const users = require('./users');
const resources = require('./resources');
const userDownloadedDocuments = sequelize.define('users_downloaded_documents',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    userId:{
        type:DataTypes.INTEGER,
        references: {
            model: users,
            key: 'id',
          },
          onDelete: 'CASCADE',
    },
    resourceId:{
        type:DataTypes.INTEGER,
        references: {
            model: resources,
            key: 'id',
          },
          onDelete: 'CASCADE',
    },
});

userDownloadedDocuments.belongsTo(users,{
    foreignKey:'userId'
})
users.hasMany(userDownloadedDocuments,{
    foreignKey:'userId'
})

userDownloadedDocuments.belongsTo(resources,{
    foreignKey:'resourceId'
})
resources.hasMany(userDownloadedDocuments,{
    foreignKey:'resourceId'
})

module.exports = userDownloadedDocuments;

