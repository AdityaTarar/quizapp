const mongoose = require("mongoose");

const Results = mongoose.model(
  "Results",
  new mongoose.Schema({
    score: String,
    quizBankId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizBank",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    timeTaken: String,
    questionsAttempted: Array,
    startTime: String,
    endTime: String,
    date: Date,
    mindScore: String,
    bodyScore: String,
    soulScore: String,
  })
);

module.exports = Results;
