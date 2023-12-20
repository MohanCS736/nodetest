const sequelize = require('../config/db');
const {DataTypes} = require('sequelize');

const resources = require('./resources');
const subjects = require('./subjects');

const resourcesHaveSubjects = sequelize.define('resources_have_subjects',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    resourceId:{
        type:DataTypes.STRING,
        allowNull:false,  
    },
    subjectId:{
        type:DataTypes.INTEGER,
        allowNull:true,
    },
});



resources.belongsToMany(subjects,{
    through: "resources_have_subjects",
    foreignKey:"resourceId",
    otherkey : 'subjectId'
})
module.exports = resourcesHaveSubjects;