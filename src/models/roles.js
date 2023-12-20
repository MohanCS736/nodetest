const sequelize = require('../config/db');
const {DataTypes} = require('sequelize');
const roles = sequelize.define('roles',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    role:{
        type:DataTypes.STRING,
        allowNull:false,
    },
});
module.exports = roles;