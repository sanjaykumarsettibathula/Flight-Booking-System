const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    flight: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flight",
      required: true,
    },
    passengerName: {
      type: String,
      required: true,
    },
    passengerEmail: {
      type: String,
      required: true,
    },
    passengerPhone: {
      type: String,
      required: true,
    },
    pnr: {
      type: String,
      required: true,
      unique: true,
    },
    seatNumber: {
      type: String,
      required: false,
    },
    seatNumbers: {
      type: [String],
      default: [],
    },
    passengerCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    journeyDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled", "completed"],
      default: "confirmed",
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    paymentId: {
      type: String,
      required: false,
    },
    ticketUrl: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Generate PNR (6 alphanumeric characters)
bookingSchema.pre("save", function (next) {
  if (!this.pnr) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pnr = "";
    for (let i = 0; i < 6; i++) {
      pnr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.pnr = pnr;
  }
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
