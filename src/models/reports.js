const sequelize = require('../config/db');
const {DataTypes} = require('sequelize');

const reports = sequelize.define('reports',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    user_id:{                            
        type:DataTypes.INTEGER,
        allowNull:false,
    },
    view:{                                                                                   
        type:DataTypes.INTEGER,
        allowNull:true,
    },
    click:{                                                                                   
        type:DataTypes.INTEGER,
        allowNull:true,
    },
    comment:{                                                                                   
        type:DataTypes.STRING,
        allowNull:true,
    }
});
module.exports = reports;