const db = require("../models");
const Results = db.results;

checkUserAttemptedQuiz = (req, res, next) => {
  console.log(req.query.userId);
  Results.find({ quizBankId: req.query.quizBankId }).then((result) => {
    // console.log("results", result);
    // if (result.includes(req.query.userId)) {
    //   res.status(400).send({
    //     message: `You have already attempted this quiz`,
    //   });
    //   return;
    // }
    result.map((id) => {
      if (id.userId === req.query.userId) {
        res.send({
          message: `You have already attempted this quiz`,
        });
        return false;
      }
    });
  });

  next();
};

const verifyQuizUser = {
  checkUserAttemptedQuiz,
};

module.exports = verifyQuizUser;
