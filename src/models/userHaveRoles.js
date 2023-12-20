const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');
const users = require('./users');
const roles = require('./roles');
const userHaveRoles = sequelize.define('user_have_roles',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    userId:{
        type:DataTypes.BIGINT,
        allowNull:false,
    },
    roleId:{
        type:DataTypes.INTEGER,
        allowNull:false,
    },
});
users.belongsToMany(roles,{
    through:'user_have_roles', /* name of junction table */
    foreignKey:'userId',      /* foreign key in junction table */
    otherKey:'roleId',        /*  */
});
roles.belongsToMany(users,{
    through:'user_have_roles',
    foreignKey:'roleId',
    otherKey:'userId',
});
module.exports = userHaveRoles;