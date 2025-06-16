const express = require("express");
const router = express.Router();
const emailController = require("../controller/email")

router.post("/sendResponse", emailController.sendResponse);

module.exports = router;
