const mongoose = require('mongoose');

const sellerBankDetailsSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  accountHolderName: {
    type: String,
    required: true,
    trim: true
  },
  accountNumber: {
    type: String,
    required: true,
    trim: true
  },
  bankName: {
    type: String,
    required: true,
    trim: true
  },
  ifscCode: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
sellerBankDetailsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('SellerBankDetails', sellerBankDetailsSchema);