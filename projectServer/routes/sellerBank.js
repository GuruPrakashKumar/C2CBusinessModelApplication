const express = require('express');
const router = express.Router();
const sellerBankController = require('../controller/sellerBank');
// const { authenticate, authorize } = require('../middleware/auth');

// Seller routes
router.post('/:sellerId', sellerBankController.saveBankDetails);
router.get('/:sellerId', sellerBankController.getBankDetails);

// Admin route
router.patch(
  '/verify/:sellerId', sellerBankController.verifyBankDetails
);

module.exports = router;