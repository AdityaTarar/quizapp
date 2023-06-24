const controller = require("../controllers/result.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.post("/api/quiz/submitResults", controller.submitResults);
  app.get("/api/quiz/getResultsByStudentId", controller.getResultsByStudentId);
  app.get("/api/quiz/getResultsByQuizId", controller.getResultsByQuizId);
  app.get(
    "/api/quiz/getResultsByQuizIdandUserID",
    controller.getResultsByQuizIdandUserID
  );
};
