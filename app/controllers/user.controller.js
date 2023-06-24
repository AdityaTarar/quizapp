const db = require("../models");

const Users = db.user;
exports.getAllUsers = (req, res) => {
  Users.find().then((user) => {
    res.send(user);
  });
};
