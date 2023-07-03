const mongoose = require("mongoose");

const QuestionBank = mongoose.model(
  "QuestionBank",
  new mongoose.Schema({
    title: String,
    description: String,
    subject: String,
    difficultyLevel: String,
    quizDuration: String,
    questionDuration: String,
    options: [
      {
        option1: { optionTitle: String, score: String },
        option2: { optionTitle: String, score: String },
        option3: { optionTitle: String, score: String },
        option4: { optionTitle: String, score: String },
      },
    ],
    correctAnswer: String,
    createdBy: String,
    questionAddedInQuiz: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "QuizBank",
      },
    ],
    status: String,
    type: String,
  })
);

module.exports = QuestionBank;
