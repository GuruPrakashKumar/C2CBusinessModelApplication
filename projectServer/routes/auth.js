const express = require("express");
const router = express.Router();
const authController = require("../controller/auth");
const { loginCheck, isAuth, isAdmin, tempVerifyToken } = require("../middleware/auth");

router.post("/isadmin", authController.isAdmin);
router.post("/signUpInit", authController.signUpInit);
router.post("/otpVerification", authController.otpVerification);
router.post("/signup", tempVerifyToken, authController.postSignup);
router.post("/signin", authController.postSignin);
router.post("/forgotPassInit", authController.forgotPassInit);
router.post("/resetPassword", loginCheck, authController.resetPassword);
router.post("/user", loginCheck, isAuth, isAdmin, authController.allUser);

module.exports = router;
