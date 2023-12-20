const sequelize = require('../config/db');
const {DataTypes} = require('sequelize');

// const subjects = require('./subjects');
const courses = require('./courses');
const users = require('./users');
const subjects = require('./subjects');
const trainingType = require('./trainingType');

const resources = sequelize.define('resources',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    documentName:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    documentDescription:{
        type:DataTypes.TEXT,
        allowNull:false,
    },
    language:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    trainingType:{
        type:DataTypes.INTEGER,
        allowNull:true,  
    },
    resourceName:{
        type:DataTypes.STRING,
        allowNull:false,  
    },
    resourceDescription:{
        type:DataTypes.TEXT,
        allowNull:false, 
    },
    fileName:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    filePath:{
        type:DataTypes.TEXT,
        allowNull:false,
    },
    view:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
    },
    status:{
        type:DataTypes.STRING,
        allowNull:false,
        defaultValue:"active",
    },
    level:{
        type:DataTypes.INTEGER,
    },
    addedByUser:{
        type:DataTypes.INTEGER,
        references: {
            model: users,
            key: 'id',
          },
          onDelete: 'CASCADE'
    },
    activatedAt:{
        type:DataTypes.DATE,
        defaultValue:new Date()   
    },
    actionTakenBy:{
        type:DataTypes.INTEGER,
        allowNull:true
    },
    declineReason:{
        type:DataTypes.TEXT,
        allowNull:true,
    },
    inFavourites:{
        type:DataTypes.INTEGER,
        allowNull:true,
        defaultValue:0  
    }
});



// resources.belongsTo(users, {
//     foreignKey: "addedByUser"
// })
resources.belongsTo(trainingType,{
    foreignKey:'trainingType'
})
trainingType.hasMany(resources,{
    foreignKey:'trainingType'
})

resources.belongsTo(users, {
    foreignKey: "addedByUser",
    as: "addedBy",
  });
  

module.exports = resources;