const SellerBankDetails = require('../models/bankDetails');
const userModel = require('../models/users');
const User = require('../models/users');

// Save or Update Bank Details
exports.saveBankDetails = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { accountHolderName, accountNumber, bankName, ifscCode } = req.body;
    // Validate input
    if (!accountHolderName || !accountNumber || !bankName || !ifscCode) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if user exists and is a seller
    const user = await userModel.findById(sellerId);

    if (!user || user.userRole !== 1) {
        console.log("executing line 26")
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Check if bank details already exist
    let bankDetails = await SellerBankDetails.findOne({ sellerId });

    if (bankDetails) {
      // Update existing details
      bankDetails.accountHolderName = accountHolderName;
      bankDetails.accountNumber = accountNumber;
      bankDetails.bankName = bankName;
      bankDetails.ifscCode = ifscCode;
      bankDetails.isVerified = false; // Reset verification status when details change
    } else {
      // Create new details
      bankDetails = new SellerBankDetails({
        sellerId,
        accountHolderName,
        accountNumber,
        bankName,
        ifscCode
      });
    }

    await bankDetails.save();

    res.status(200).json({
      success: true,
      message: 'Bank details saved successfully',
      data: bankDetails
    });

  } catch (error) {
    console.error('Error saving bank details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get Bank Details
exports.getBankDetails = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const bankDetails = await SellerBankDetails.findOne({ sellerId });

    if (!bankDetails) {
      return res.status(404).json({
        success: false,
        message: 'Bank details not found'
      });
    }

    res.status(200).json({
      success: true,
      data: bankDetails
    });

  } catch (error) {
    console.error('Error fetching bank details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin Verification Endpoint
exports.verifyBankDetails = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { isVerified } = req.body;

    const bankDetails = await SellerBankDetails.findOneAndUpdate(
      { sellerId },
      { isVerified },
      { new: true }
    );

    if (!bankDetails) {
      return res.status(404).json({
        success: false,
        message: 'Bank details not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Bank details ${isVerified ? 'verified' : 'unverified'} successfully`,
      data: bankDetails
    });

  } catch (error) {
    console.error('Error verifying bank details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};