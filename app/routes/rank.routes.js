const controller = require("../controllers/rank.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/admin/getRanksByQuiz", controller.getRanksByQuiz);
  app.get("/api/admin/getRankByQuizIdUserId", controller.getRankByQuizIdUserId);
  app.get("/api/admin/getOverAllRankings", controller.getOverallRanking);
  app.get("/api/admin/getUserRankByCity", controller.getUserRankByCity);
  app.get("/api/admin/getUserRankByAllQuiz", controller.getUserRankByAllQuiz);
  app.get("/api/admin/getUserLocalRank", controller.getUserLocalRank);
};
