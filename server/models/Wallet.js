const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 50000, // Default balance of ₹50,000
      min: 0,
    },
    transactions: [
      {
        amount: {
          type: Number,
          required: true,
        },
        type: {
          type: String,
          enum: ["credit", "debit"],
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        booking: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Booking",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Method to add funds to wallet
walletSchema.methods.addFunds = async function (
  amount,
  description = "Wallet top-up"
) {
  this.balance += amount;
  this.transactions.push({
    amount,
    type: "credit",
    description,
  });
  return this.save();
};

// Method to deduct funds from wallet
walletSchema.methods.deductFunds = async function (
  amount,
  description,
  bookingId = null
) {
  if (this.balance < amount) {
    throw new Error("Insufficient balance");
  }

  this.balance -= amount;
  this.transactions.push({
    amount,
    type: "debit",
    description,
    booking: bookingId,
  });

  return this.save();
};

// Static method to get or create wallet for user
walletSchema.statics.getOrCreateWallet = async function (userId) {
  let wallet = await this.findOne({ user: userId });

  if (!wallet) {
    wallet = await this.create({ user: userId });
  }

  return wallet;
};

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
