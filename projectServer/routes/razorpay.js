const express = require("express");
const router = express.Router();
const razorpayController = require("../controller/razorpay");

router.post("/razorpay/order", razorpayController.order);
router.get("/razorpay/:paymentId", razorpayController.paymentFetch);

module.exports = router;
