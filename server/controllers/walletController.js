const Wallet = require("../models/Wallet");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

// @desc    Get or create current user's wallet
// @route   GET /api/wallet
// @access  Private
exports.getWallet = asyncHandler(async (req, res, next) => {
  const wallet = await Wallet.getOrCreateWallet(req.user.id);

  res.status(200).json({
    success: true,
    data: wallet,
  });
});

// @desc    Add funds to wallet
// @route   POST /api/wallet/add-funds
// @access  Private
exports.addFunds = asyncHandler(async (req, res, next) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return next(new ErrorResponse("Please provide a valid amount", 400));
  }

  const wallet = await Wallet.getOrCreateWallet(req.user.id);
  const updatedWallet = await wallet.addFunds(amount, "Wallet top-up");

  const lastTransaction =
    updatedWallet.transactions[updatedWallet.transactions.length - 1];

  res.status(200).json({
    success: true,
    data: {
      balance: updatedWallet.balance,
      transaction: lastTransaction,
    },
  });
});

// @desc    Withdraw funds from wallet
// @route   POST /api/wallet/withdraw
// @access  Private
exports.withdrawFunds = asyncHandler(async (req, res, next) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return next(new ErrorResponse("Please provide a valid amount", 400));
  }

  const wallet = await Wallet.getOrCreateWallet(req.user.id);

  try {
    const updatedWallet = await wallet.deductFunds(
      amount,
      "Wallet withdrawal"
    );

    const lastTransaction =
      updatedWallet.transactions[updatedWallet.transactions.length - 1];

    res.status(200).json({
      success: true,
      data: {
        balance: updatedWallet.balance,
        transaction: lastTransaction,
      },
    });
  } catch (err) {
    return next(new ErrorResponse(err.message || "Insufficient balance", 400));
  }
});

// @desc    Get wallet transactions
// @route   GET /api/wallet/transactions
// @access  Private
exports.getTransactions = asyncHandler(async (req, res, next) => {
  const wallet = await Wallet.getOrCreateWallet(req.user.id);

  // Return transactions sorted by newest first
  const transactions = [...wallet.transactions].sort(
    (a, b) => b.createdAt - a.createdAt
  );

  res.status(200).json({
    success: true,
    data: transactions,
  });
});

// @desc    Transfer funds to another user's wallet
// @route   POST /api/wallet/transfer
// @access  Private
exports.transferFunds = asyncHandler(async (req, res, next) => {
  const { amount, recipientId } = req.body;

  if (!amount || amount <= 0 || !recipientId) {
    return next(
      new ErrorResponse("Please provide a valid amount and recipientId", 400)
    );
  }

  if (recipientId === String(req.user.id)) {
    return next(new ErrorResponse("Cannot transfer funds to yourself", 400));
  }

  const senderWallet = await Wallet.getOrCreateWallet(req.user.id);
  const recipientWallet = await Wallet.getOrCreateWallet(recipientId);

  // Deduct from sender
  await senderWallet.deductFunds(amount, "Wallet transfer to user", null);

  // Add to recipient
  await recipientWallet.addFunds(amount, "Wallet transfer from user");

  const updatedSender = await Wallet.findById(senderWallet._id);

  res.status(200).json({
    success: true,
    data: {
      balance: updatedSender.balance,
    },
  });
});
