const express = require("express");
const router = express.Router();
const bidsController = require("../controller/bids");

router.post("/place-bid", bidsController.placeBid);
router.post("/update-bid", bidsController.postUpdateBid);
router.post("/user-product-bid/:productId", bidsController.getBidForUser);
router.post("/seller-all-bids", bidsController.getAllBidsForSeller);
router.post("/respond/:bidId", bidsController.respondBid);


module.exports = router;
