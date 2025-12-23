const mongoose = require("mongoose");

const flightSchema = new mongoose.Schema(
  {
    flightNumber: {
      type: String,
      required: true,
      unique: true,
    },
    airline: {
      type: String,
      required: true,
    },
    departureCity: {
      type: String,
      required: true,
    },
    arrivalCity: {
      type: String,
      required: true,
    },
    departureTime: {
      type: Date,
      required: true,
    },
    arrivalTime: {
      type: Date,
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 2000,
      max: 3000,
    },
    currentPrice: {
      type: Number,
      required: true,
    },
    totalSeats: {
      type: Number,
      default: 100,
    },
    availableSeats: {
      type: Number,
      default: 100,
    },
    lastPriceUpdate: {
      type: Date,
      default: Date.now,
    },
    bookingAttempts: [
      {
        timestamp: {
          type: Date,
          default: Date.now,
        },
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Method to update price based on booking attempts
flightSchema.methods.updatePrice = function () {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

  // Filter booking attempts in the last 5 minutes
  const recentAttempts = this.bookingAttempts.filter(
    (attempt) => attempt.timestamp > fiveMinutesAgo
  );

  // Reset price if last update was more than 10 minutes ago
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
  if (this.lastPriceUpdate < tenMinutesAgo) {
    this.currentPrice = this.basePrice;
    this.lastPriceUpdate = now;
    return this.save();
  }

  // Apply surge pricing if needed
  if (recentAttempts.length >= 3 && this.currentPrice === this.basePrice) {
    this.currentPrice = Math.min(
      Math.floor(this.basePrice * 1.1), // 10% increase
      this.basePrice * 1.5 // Cap at 50% increase
    );
    this.lastPriceUpdate = now;
    return this.save();
  }

  return Promise.resolve(this);
};

// Add a booking attempt
flightSchema.methods.addBookingAttempt = function (userId) {
  this.bookingAttempts.push({ userId });
  return this.save();
};

const Flight = mongoose.model("Flight", flightSchema);

module.exports = Flight;
