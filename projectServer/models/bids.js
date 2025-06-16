const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const bidSchema = new mongoose.Schema(
  {
    userBid: {
      type: Number,
      required: true,
    },
    sellerBid: {
        type: Number,
    },
    bUser: {
        type: ObjectId,
        ref: "users",
        required: true,
    },
    bStatus: {
      type: String,
      required: true,
    },
    bSeller: {
      type: ObjectId,
      ref: "users",
      required: true,
    },
    product: {
        type: ObjectId,
        ref: "products",
        required: true,
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days expiration
    }
  },
  { timestamps: true }
);
// Add index for better query performance
bidSchema.index({ product: 1, bStatus: 1 });
bidSchema.index({ bUser: 1 });
bidSchema.index({ bSeller: 1 });

// Auto-expire bids
bidSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const bidModel = mongoose.model("bids", bidSchema);
module.exports = bidModel;
