const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/keys");
const userModel = require("../models/users");

exports.loginCheck = async (req, res, next) => {
  try {
    let token = req.headers.token;
    token = token.replace("Bearer ", "");
    const decode = jwt.verify(token, JWT_SECRET);
    const docId = decode._id;
    const user = await userModel.findOne({ _id: docId });

    if (user && user.password) {
      req.userDetails = decode;
      next();
    } else {
      res.json({
        error: "You must be logged in",
      });
    }
  } catch (err) {
    res.json({
      error: "You must be logged in",
    });
  }
};

exports.tempVerifyToken = async (req, res, next) => {
  try {
    let token = req.headers.token;
    token = token.replace("Bearer ", "");
    const decode = jwt.verify(token, JWT_SECRET);
    const docId = decode._id;
    const user = await userModel.findOne({ _id: docId });
    if (user) {
      req.userDetails = decode;
      next();
    } else {
      res.json({
        error: "You must be logged in",
      });
    }
  } catch (err) {
    res.json({
      error: "You must be logged in",
    });
  }
};

exports.isAuth = (req, res, next) => {
  let { loggedInUserId } = req.body;
  if (
    !loggedInUserId ||
    !req.userDetails._id ||
    loggedInUserId != req.userDetails._id
  ) {
    res.status(403).json({ error: "You are not authenticate" });
  }
  next();
};

exports.isAdmin = async (req, res, next) => {
  try {
    let reqUser = await userModel.findById(req.body.loggedInUserId);
    // If user role 0 that's mean not admin it's customer
    if (reqUser.userRole === 0) {
      res.status(403).json({ error: "Access denied" });
    }
    next();
  } catch {
    res.status(404);
  }
};
