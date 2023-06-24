const db = require("../models");

const mongoose = require("mongoose");

const Results = db.results;

exports.submitResults = (req, res) => {
  console.log(req);
  const result = new Results({
    score: req.body.score,
    quizBankId: req.body.quizBankId,
    userId: req.body.userId,
    timeTaken: req.body.timeTaken,
    questionsAttempted: req.body.questionsAttempted.map((s) =>
      mongoose.Types.ObjectId(s)
    ),
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    date: req.body?.date,
  });
  console.log("results", result);
  result.save((err, result) => {
    result.save((err) => {
      if (err) {
        res.send(err);
      }
      res.send("result submitted");
    });
  });
};
exports.getResultsByStudentId = (req, res) => {
  Results.find({ userId: req.query.userId })
    .populate("quizBankId", "title")
    .then((result) => {
      res.send(result);
    });
};
exports.getResultsByQuizId = (req, res) => {
  Results.find({ quizBankId: req.body.quizBankId })
    .populate("userId")
    .then((result) => {
      res.send(result);
    });
};
exports.getResultsByQuizIdandUserID = (req, res) => {
  Results.find({
    quizBankId: req.body.quizBankId,
    userId: req.body.userId,
  })
    .populate("quizBankId")
    .then((result) => {
      res.send(result);
    });
};
