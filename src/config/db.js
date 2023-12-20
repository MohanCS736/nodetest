require("dotenv").config();
const sequelize = require("sequelize");
const dbConfig = require('./db.config')
const seque = new sequelize(dbConfig[process.env.NODE_ENV]);
// const seque = new sequelize({
//   database: process.env.DB_NAME,
//   username: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   host: process.env.DB_HOST,
//   dialect: "mysql",
//   logging: false,
// });
// const seque = new sequelize({
//   dialect: "sqlite",
//   storage: ":memory:",
//   logging:false, 
// });
seque
  .authenticate()
  .then(() => {
    console.log("connected to the database");
  })
  .catch((e) => {
    console.log(`unable to connect to the database error :${e}`);
  });

module.exports = seque;
