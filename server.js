require("dotenv").config();
const app = require("./src/app");
const sequelize = require("./src/config/db");

const roles = require("./src/models/roles"); // Assuming your Sequelize model is in a separate file
const documentLevels = require("./src/models/documentLevels"); // Assuming your Sequelize model is in a separate file
const user = require("./src/models/users"); // Assuming your Sequelize model is in a separate file
const userHaveRoles = require("./src/models/userHaveRoles");
const permissions = require("./src/models/permissions");
// Define an array of predefined roles with IDs and role names
const {
  predefinedRoles,
  preDefinedDocumentLevel,
  perMissions,
  users,
  assignRole,
} = require("./src/config/databaseData");

// Use Sequelize to insert the predefined roles into the database

// /* sync the database  */
// sequelize
// .sync({ alter: true })
sequelize
  .sync()
  .then(() => {
    roles.bulkCreate(predefinedRoles, { ignoreDuplicates: true });
    documentLevels.bulkCreate(preDefinedDocumentLevel, {
      ignoreDuplicates: true,
    });
    user.bulkCreate(users, { ignoreDuplicates: true });
    userHaveRoles.bulkCreate(assignRole, { ignoreDuplicates: true });
    permissions.bulkCreate(perMissions, { ignoreDuplicates: true });
  })
  .then(() => {
    console.log("Predefined roles inserted successfully.");
  })
  .then(() => {
    console.log("Database synced");
    /* if database synced successfuly then start application */
    app.listen(process.env.PORT, () => {
      console.log(
        `server is running on port: ${process.env.PORT} URL: http://127.0.0.1:3010`
      );
    });
  })
  .catch((e) => {
    console.log(`unable to sync the database error:${e}`);
  });
