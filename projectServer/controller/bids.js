const orderModel = require("../models/orders");
const productModel = require("../models/products");
const bidModel = require("../models/bids");
class Bid {
  async placeBid(req, res) {
    try {
      const { productId, userBid, sellerId, userId } = req.body;
      // Validate bid amount
      if (userBid <= 0) {
        return res.status(400).json({ error: "Bid amount must be positive" });
      }

      const newBid = new bidModel({
        userBid,
        bUser: userId,
        bStatus: "pending", // Initial status
        bSeller: sellerId, // Should be passed from frontend
        product: productId // Assuming you want to track which product this is for
      });

      await newBid.save();

      res.status(201).json({
        message: "Bid placed successfully",
        success: true,
        bid: newBid
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async postUpdateBid(req, res) {
    let { bId, bStatus, sellerBid, userBid } = req.body;
    if (!bId) {
      return res.json({ message: "All filled must be required" });
    } else {
      let updateData = {
        updatedAt: Date.now(),
        bStatus: "pending"
      };
      if (bStatus) { updateData.bStatus = "pending" }
      if (sellerBid) { updateData.sellerBid = sellerBid }
      if (userBid) { updateData.userBid = userBid }
      let currentOrder = bidModel.findByIdAndUpdate(bId, updateData);
      currentOrder.exec((err, result) => {
        if (err) console.log(err);
        return res.json({ success: "Bid updated successfully" });
      });
    }
  }

  async getBidForUser(req, res) {
    try {
      const { userId } = req.body;
      const bid = await bidModel.findOne({
        bUser: userId,
        product: req.params.productId
      })
        .populate("bSeller", "name email")
        .populate("product", "pName pPrice pImages");

      if (!bid) {
        return res.status(404).json({
          message: "No bid found for this product",
          hasBid: false
        });
      }

      res.json({
        message: "Bid found",
        hasBid: true,
        bid
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async respondBid(req, res){
    // try {
      const { action, userId, sellerBid } = req.body;
      const bid = await bidModel.findById(req.params.bidId);

      if (!bid) {
        return res.status(404).json({ error: "Bid not found" });
      }

      // Verify this seller owns the product being bid on
      if (!bid.bSeller.equals(userId)) {
        return res.status(403).json({ error: "Not authorized" });
      }

      switch (action) {
        case "accept":
          bid.bStatus = "accepted";
          break;
        case "reject":
          bid.bStatus = "rejected";
          break;
        case "counter":
          if (!sellerBid || sellerBid <= 0) {
            return res.status(400).json({ error: "Invalid counter bid amount" });
          }
          bid.sellerBid = sellerBid;
          bid.bStatus = "countered";
          break;
        default:
          return res.status(400).json({ error: "Invalid action" });
      }

      await bid.save();
      
      res.json({
        message: `Bid ${action}ed successfully`,
        bid
      });
    // } catch (error) {
    //   res.status(500).json({ error: error.message });
    // }
  }
  async getAllBidsForSeller(req, res) {
    try {
      // Get all bids where the current user is the seller
      const bids = await bidModel.find({ bSeller: req.body.sellerId })
        .populate({
          path: "product",
          select: "pName pPrice pImages",
          populate: {
            path: "category",
            select: "cName"
          }
        })
        .populate("bUser", "name email phone")
        .sort({ createdAt: -1 });
  
      // Group by product for better organization
      const bidsByProduct = bids.reduce((acc, bid) => {
        const productId = bid.product._id.toString();
        if (!acc[productId]) {
          acc[productId] = {
            product: bid.product,
            bids: []
          };
        }
        acc[productId].bids.push(bid);
        return acc;
      }, {});
  
      res.json({
        totalBids: bids.length,
        products: Object.values(bidsByProduct)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }


}

const bidsController = new Bid();
module.exports = bidsController;
