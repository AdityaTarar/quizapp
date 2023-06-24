const controller = require("../controllers/quizControllers");
const verifyQuizUser = require("../middlewares/verifyQuizUser");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.post("/api/admin/addQuestions", controller.addQuestions);
  app.post("/api/admin/publishQuestion", controller.publishQuestion);
  app.post("/api/admin/publishQuiz", controller.publishQuiz);
  app.post("/api/admin/addQuiz", controller.createQuiz);
  app.get("/api/admin/getQuizByID", controller.getQuizById);
  app.get("/api/admin/getAllQuizAvailable", controller.getAllQuizAvailable);
  app.get("/api/admin/getAllQuestions", controller.getAllQuestions);
};
