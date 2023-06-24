const config = require("../config/auth.config");
const nodemailer = require("../config/nodemailer.config");
const db = require("../models");
const User = db.user;
const Role = db.role;

const accountSid = "AC48d7ee453d89a1e2689fe333446c8844";
const authToken = "710bfec7758db29e9f2906e619653ce9";
const client = require("twilio")(accountSid, authToken);
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  const user = new User({
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    middleName: req.body.middleName,
    city: req.body.city,
    dob: req.body.dob,
    class: req.body.class,
    gender: req.body.gender,
    school: req.body.school,
    mobileNumber: req.body.mobileNumber,
    state: req.body.state,
  });

  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (req.body.roles) {
      Role.find(
        {
          name: { $in: req.body.roles },
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          user.roles = roles.map((role) => role._id);
          user.save((err) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            res.send({ message: "User was registered successfully!" });
            client.messages
              .create({
                body: "Your appointment is coming up on July 21 at 3PM",
                from: "whatsapp:+14155238886",
                to: `whatsapp:+91${req.body.mobileNumber}`,
              })
              .then((message) => console.log(message.sid))
              .catch((error) => console.error(error));
          });
        }
      );
    } else {
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        user.roles = [role._id];
        user.save((err) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          console.log("req.body.mobileNumber", user);
          res.send({ message: "User was registered successfully!" });
          client.messages
            .create({
              body: `Hi ${user?.firstName} ${user?.lastName} welcome to our quiz app. Your registration has been successfully completed here is user User Id :${user?.mbsId} use this to login in the app `,
              from: "whatsapp:+14155238886",
              to: `whatsapp:+91${req.body.mobileNumber}`,
            })
            .then((message) => console.log(message.sid))
            .catch((error) => console.error(error));
        });
      });
    }
  });
};

exports.signin = (req, res) => {
  console.log(req.body);
  User.findOne({
    email: req.body.email, // Update the field to check for email instead of mbsId
  })
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!",
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400, // 24 hours
      });

      var authorities = [];

      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }
      res.status(200).send({
        id: user._id,
        email: user.email,
        accessToken: token,
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName,
        city: user.city,
        dob: user.dob,
        class: user.class,
        gender: user.gender,
        school: user.school,
        mobileNumber: user.mobileNumber,
        mbsId: user.mbsId,
        state: user.state,
      });
    });
};

// exports.signin = (req, res) => {
//   User.findOne({
//     mbsId: req.body.mbsId,
//   })
//     .populate("roles", "-__v")
//     .exec((err, user) => {
//       if (err) {
//         res.status(500).send({ message: err });
//         return;
//       }

//       if (!user) {
//         return res.status(404).send({ message: "User Not found." });
//       }

//       var passwordIsValid = bcrypt.compareSync(
//         req.body.password,
//         user.password
//       );

//       if (!passwordIsValid) {
//         return res.status(401).send({
//           accessToken: null,
//           message: "Invalid Password!",
//         });
//       }

//       var token = jwt.sign({ id: user.id }, config.secret, {
//         expiresIn: 86400, // 24 hours
//       });

//       var authorities = [];

//       for (let i = 0; i < user.roles.length; i++) {
//         authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
//       }
//       res.status(200).send({
//         id: user._id,
//         email: user.email,
//         accessToken: token,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         middleName: user.middleName,
//         city: user.city,
//         dob: user.dob,
//         class: user.class,
//         gender: user.gender,
//         school: user.school,
//         mobileNumber: user.mobileNumber,
//         mbsId: user.mbsId,
//         state: user.state,
//       });
//     });
// };
