const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getWallet,
  addFunds,
  withdrawFunds,
  getTransactions,
  transferFunds,
} = require("../controllers/walletController");

// Protected routes
router.use(protect);
router.get("/", getWallet);
router.post("/add-funds", addFunds);
router.post("/withdraw", withdrawFunds);
router.post("/transfer", transferFunds);
router.get("/transactions", getTransactions);

module.exports = router;
