const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const resources = require("./resources");
const subject = require("./subjects");
const users = require("./users");

const cart = sequelize.define("cart", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: users,
      key: "id",
    },
    onDelete: "CASCADE",
  },
  resourceId: {
    type: DataTypes.INTEGER,
    references: {
      model: resources,
      key: "id",
    },
    onDelete: "CASCADE",
  },
});

cart.belongsTo(users, {
  foreignKey: "userId",
});
users.hasMany(cart, {
  foreignKey: "userId",
});
cart.belongsTo(resources, {
  foreignKey: "resourceId",
});
resources.hasMany(cart, {
  foreignKey: "resourceId",
});
module.exports = cart;
