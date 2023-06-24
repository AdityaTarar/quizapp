const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    mbsId: {
      type: String,
      default: () => {
        const randomNums = Math.floor(Math.random() * 1000000)
          .toString()
          .padStart(4, "0");
        const year = new Date().getFullYear().toString().slice(-2);
        const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
        return randomNums + year + month;
      },
      unique: true,
    },
    password: String,
    firstName: String,
    lastName: String,
    middleName: String,
    email: { type: String, unique: true },
    city: String,
    dob: String,
    class: String,
    gender: String,
    school: String,
    mobileNumber: String,
    hobbies: String,
    achivements: String,
    state: String,
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
      },
    ],
  })
);

module.exports = User;
