const sequelize = require('../config/db');
const {DataTypes, BelongsTo} = require('sequelize');
const users = require('./users');
const resources = require('./resources');
const subjects = sequelize.define('subjects',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    image:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    image_url:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    description:{
        type:DataTypes.TEXT,
        allowNull:false,
    },
    view:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
    },
    addedByUser:{
        type:DataTypes.INTEGER,
        references: {
            model: users,
            key: 'id',
          },
          onDelete: 'CASCADE'
    },
});


subjects.belongsTo(users, {
    foreignKey : 'addedByUser',
})

module.exports = subjects;