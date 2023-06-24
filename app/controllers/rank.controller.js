const db = require("../models");
const User = db.user;
const Result = db.results;
const mongoose = require("mongoose");

exports.getRanksByQuiz = async (req, res) => {
  try {
    // Find all the results for the given quizId
    const results = await Result.find({
      quizBankId: req.query.quizBankId,
    });

    // Group the results by userId and calculate the total score and time taken for each user
    const userScores = results.reduce((acc, result) => {
      const { userId, score, timeTaken } = result;
      if (!acc[userId]) {
        acc[userId] = {
          totalScore: 0,
          totalTimeTaken: 0,
          quizCount: 0,
        };
      }
      acc[userId].totalScore += score;
      acc[userId].totalTimeTaken += timeTaken;
      acc[userId].quizCount++;
      return acc;
    }, {});

    // Calculate the average score and time taken for each user
    const userAverages = Object.keys(userScores).reduce((acc, userId) => {
      const { totalScore, totalTimeTaken, quizCount } = userScores[userId];
      acc[userId] = {
        averageScore: totalScore / quizCount,
        averageTimeTaken: totalTimeTaken / quizCount,
      };
      return acc;
    }, {});

    // Sort the users by score and time taken
    const sortedUsers = Object.keys(userAverages).sort((a, b) => {
      const scoreDiff = userScores[b].totalScore - userScores[a].totalScore;
      const timeDiff =
        userAverages[a].averageTimeTaken - userAverages[b].averageTimeTaken;
      return scoreDiff !== 0 ? scoreDiff : timeDiff;
    });

    // Get the rank for each user based on their score and time taken
    const usersWithRanks = sortedUsers.map((userId, index) => {
      const score = userScores[userId].totalScore;
      const timeTaken = userAverages[userId].averageTimeTaken;
      const rank = index + 1;
      return User.findById(userId)
        .select("firstName lastName email mbsId")
        .lean()
        .then((user) => ({ rank, user: { ...user, score, timeTaken } }));
    });

    // Send the users with ranks as a JSON response
    const rankedUsers = await Promise.all(usersWithRanks);
    res.json({ usersWithRanks: rankedUsers });
  } catch (error) {
    next(error);
  }
};
exports.getRankByQuizIdUserId = async (req, res) => {
  try {
    // Find all the results for the given quizId
    const results = await Result.find({
      quizBankId: req.query.quizBankId,
    });

    // Group the results by userId and calculate the total score for each user
    const userScores = results.reduce((acc, result) => {
      const { userId, score } = result;
      acc[userId] = (acc[userId] || 0) + score;
      return acc;
    }, {});

    // Sort the user scores in descending order
    const sortedScores = Object.values(userScores).sort((a, b) => b - a);

    // Get the rank for each user based on their score
    const usersWithRanks = [];
    const userIds = Object.keys(userScores);
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      const score = userScores[userId];
      const rank = sortedScores.indexOf(score) + 1;
      const user = await User.findById(userId);

      if (user) {
        usersWithRanks.push({ rank, user });
      }
    }
    const userank = usersWithRanks.map((val) => {
      console.log("req.query.userId", req.query.userId);
      console.log("val.user._id");
      if (val.user._id == req.query.userId) {
        return val.rank;
      }
    });

    res.json(userank.filter(Number));
  } catch (error) {
    next(error);
  }
};

exports.getUserRankByCity = async (req, res, next) => {
  try {
    const { city } = req.query;

    // Find all the users from the given city
    const users = await User.find({ city });

    // Find all the results for the users from the given city
    const results = await Result.find({
      userId: { $in: users.map((u) => u._id) },
    });

    // Calculate the total score and time taken for each user
    const userScores = results.reduce((acc, result) => {
      const { userId, score, timeTaken } = result;
      acc[userId] = acc[userId] || { score: 0, timeTaken: 0 };
      acc[userId].score += parseInt(score);
      acc[userId].timeTaken += parseInt(timeTaken);
      return acc;
    }, {});

    // Sort the user scores by score and time taken
    const sortedScores = Object.entries(userScores).sort((a, b) => {
      if (b[1].score === a[1].score) {
        return a[1].timeTaken - b[1].timeTaken;
      }
      return b[1].score - a[1].score;
    });

    // Get the rank for each user based on their score and time taken
    const usersWithRanks = [];
    for (let i = 0; i < sortedScores.length; i++) {
      const [userId, { score, timeTaken }] = sortedScores[i];
      const rank = i + 1;
      const user = await User.findById(userId);

      if (user) {
        usersWithRanks.push({
          rank,
          user: { ...user.toObject(), score, timeTaken },
        });
      }
    }

    // Send the users with ranks as a JSON response
    res.json(usersWithRanks);
  } catch (error) {
    next(error);
  }
};

exports.getOverallRanking = async (req, res, next) => {
  try {
    // Extract the requested month from the query parameters
    const requestedMonth = Number(req.query.month);

    // Extract the requested class from the query parameters
    const requestedClass = req.query.class;

    // Prepare the date filter based on the requested month
    let dateFilter = {};
    if (requestedMonth) {
      dateFilter = {
        date: {
          $gte: new Date(new Date().getFullYear(), requestedMonth - 1, 1),
          $lt: new Date(new Date().getFullYear(), requestedMonth, 1),
        },
      };
    }

    // Find all the results based on the date filter
    const results = await Result.find(dateFilter).populate("userId");

    // Filter results based on the requested class
    filteredResults = results.filter(
      (result) => result.userId && result.userId.class === requestedClass
    );

    // Calculate the total score and time taken for each user in the requested class
    const userScores = filteredResults.reduce((acc, result) => {
      const { userId, score, timeTaken } = result;
      const scoreAsNumber = Number(score);
      acc[userId._id] = acc[userId._id] || { score: 0, timeTaken: 0 };
      acc[userId._id].score += scoreAsNumber;
      acc[userId._id].timeTaken += timeTaken;
      return acc;
    }, {});

    // Sort the user scores by score and time taken
    const sortedScores = Object.values(userScores).sort((a, b) => {
      if (b.score === a.score) {
        return a.timeTaken - b.timeTaken;
      }
      return b.score - a.score;
    });

    // Get the rank for each user based on their score and time taken
    const usersWithRanks = [];
    const userIds = Object.keys(userScores);
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      const score = userScores[userId].score;
      const timeTaken = userScores[userId].timeTaken;
      const rank =
        sortedScores.findIndex(
          (s) => s.score === score && s.timeTaken === timeTaken
        ) + 1;
      const user = await User.findById(userId);

      if (user) {
        usersWithRanks.push({ rank, user, score, timeTaken });
      }
    }

    // Sort the users by rank
    usersWithRanks.sort((a, b) => a.rank - b.rank);

    // Send the users with ranks and scores as a JSON response
    res.json(usersWithRanks);
  } catch (error) {
    next(error);
  }
};

exports.getUserRankByAllQuiz = async (req, res, next) => {
  try {
    const { userId } = req.query;

    // Find all the results for the user
    const results = await Result.find({ userId }).populate("userId");

    // Calculate the total score and time taken for each quiz
    const quizScores = results.reduce((acc, result) => {
      const { quizBankId, score } = result;
      acc[quizBankId] = acc[quizBankId] || { score: 0 };
      acc[quizBankId].score += parseInt(score);
      return acc;
    }, {});

    // Sort the quiz scores by score
    const sortedScores = Object.values(quizScores).sort(
      (a, b) => b.score - a.score
    );

    // Get the rank for each quiz based on its score
    const quizzesWithRanks = [];
    const quizIds = Object.keys(quizScores);
    for (let i = 0; i < quizIds.length; i++) {
      const quizId = quizIds[i];
      const score = quizScores[quizId].score;
      const rank = sortedScores.findIndex((s) => s.score === score) + 1;
      quizzesWithRanks.push({ rank, quizId, score });
    }

    // Send the quizzes with ranks as a JSON response
    res.json(quizzesWithRanks);
  } catch (error) {
    next(error);
  }
};
exports.getUserLocalRank = async (req, res, next) => {
  try {
    const { city, userId } = req.query;

    // Find the user based on the provided userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const requestedClass = user.class;

    // Find all the users from the given city and class
    const users = await User.find({ city, class: requestedClass });

    // Find all the results for the users from the given city and class
    const results = await Result.find({
      userId: { $in: users.map((u) => u._id) },
    });

    // Calculate the total score and time taken for each user
    const userScores = results.reduce((acc, result) => {
      const { userId, score, timeTaken } = result;
      acc[userId] = acc[userId] || { score: 0, timeTaken: 0 };
      acc[userId].score += parseInt(score);
      acc[userId].timeTaken += parseInt(timeTaken);
      return acc;
    }, {});

    // Sort the user scores by score and time taken
    const sortedScores = Object.entries(userScores).sort((a, b) => {
      if (b[1].score === a[1].score) {
        return a[1].timeTaken - b[1].timeTaken;
      }
      return b[1].score - a[1].score;
    });

    // Get the rank for the specified user based on their score and time taken
    let userRank = null;
    for (let i = 0; i < sortedScores.length; i++) {
      const [userId] = sortedScores[i];
      if (userId.toString() === userId) {
        userRank = i + 1;
        break;
      }
    }

    // Send the user rank as a JSON response
    res.json({ rank: userRank });
  } catch (error) {
    next(error);
  }
};
