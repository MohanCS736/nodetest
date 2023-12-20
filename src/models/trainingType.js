const sequelize = require('../config/db');
const {DataTypes} = require('sequelize');

const resources = require('./resources');
const users = require('./users');

const trainingType = sequelize.define('training_type',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    trainingName:{
        type:DataTypes.STRING,
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
    status:{
        type:DataTypes.INTEGER,
        allowNull:true,
        defaultValue: 1,
    },
});



trainingType.belongsTo(users, {
    foreignKey: "addedByUser"
})


module.exports = trainingType;