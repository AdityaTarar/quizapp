const db = require("../models");

const QuestionBank = db.questionBank;
const QuizBank = db.quizBank;
const Results = db.results;

exports.addQuestions = (req, res) => {
  const question = new QuestionBank({
    title: req.body.title,
    description: req.body.description,
    subject: req.body.subject,
    difficultyLevel: req.body.difficultyLevel,
    quizDuration: req.body.quizDuration,
    questionDuration: req.body.questionDuration,
    options: req.body.options,
    correctAnswer: req.body.correctAnswer,
    createdBy: req.body.createdBy,
    status: "draft",
  });

  question.save((err, question) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    question.save((err) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      res.send({ message: "Question was added successfully!" });
    });
  });
};
exports.publishQuestion = (req, res) => {
  const questionId = req.body.questionId;
  QuestionBank.findById(questionId, (err, question) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (!question) {
      res.status(404).send({ message: "Question not found." });
      return;
    }
    console.log("question.status", question.status);

    if (question.status === "publish") {
      // If the question is already published, update the status to "draft"
      question.status = "draft";
    } else {
      // If the question is not published, update the status to "publish"
      question.status = "publish";
    }

    question.save((err, updatedQuestion) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      res.send({
        message: `Question status updated to '${updatedQuestion.status}'`,
      });
    });
  });
};

exports.createQuiz = (req, res) => {
  const quiz = new QuizBank({
    quizDuration: req.body.quizDuration,
    isActive: req.body.isActive,
    activeFrom: req.body.activeFrom,
    activeTo: req.body.activeTo,
    createdBy: req.body.createdBy,
    questions: req.body.questions,
    title: req.body.title,
    board: req.body.board,
    medium: req.body.medium,
    negativeMarking: req.body.negativeMarking,
    swapable: req.body.swapable,
    standard: req.body.standard,
    video: req.body.video,
    status: "draft",
  });

  quiz.save((err, quiz) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    addQuestionstoQuiz(req.body.questions).then((Results) => {
      res.send("Quiz Created");
    });
  });
};

exports.publishQuiz = (req, res) => {
  const quizId = req.params.quizId;

  QuizBank.findById(quizId, (err, quiz) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (!quiz) {
      res.status(404).send({ message: "Quiz not found." });
      return;
    }

    console.log("quiz.status", quiz.status);

    if (quiz.status === "publish") {
      // If the quiz is already published, update the status to "draft"
      quiz.status = "draft";
    } else {
      // If the quiz is not published, update the status to "publish"
      quiz.status = "publish";
    }

    quiz.save((err, updatedQuiz) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      res.send({
        message: `Quiz status updated to '${updatedQuiz.status}'.`,
      });
    });
  });
};

exports.getQuizById = (req, res) => {
  QuizBank.findById(req.query.quizBankId)
    .populate("questions")
    .then((quiz) => {
      res.send(quiz);
    });
};
exports.getAllQuizAvailable = async (req, res) => {
  // QuizBank.find()
  //   .populate("questions")
  //   .then((quiz) => {
  //     res.send(quiz);
  //   });
  const userId = req.query.userId;
  const attemptedQuizzes = await Results.find({ userId });
  const attemptedQuizIds = attemptedQuizzes.map((quiz) => quiz.quizBankId);
  const quizData = await QuizBank.find({ _id: { $nin: attemptedQuizIds } });
  res.json(quizData);
};
exports.getAllQuestions = (req, res) => {
  QuestionBank.find().then((quiz) => {
    res.send(quiz);
  });
};
const addQuestionstoQuiz = function (tag) {
  return db.quizBank.findByIdAndUpdate(
    "6419422756e7fe6961911d69",
    { $push: { questions: tag } },
    { new: true, useFindAndModify: false }
  );
};
