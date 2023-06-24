const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user.model");
db.role = require("./role.model");
db.questionBank = require("./questionBank.model");
db.quizBank = require("./quizBank.model");
db.results = require("./result.model");

db.ROLES = ["user", "admin", "moderator"];

module.exports = db;
