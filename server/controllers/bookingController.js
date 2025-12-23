const Booking = require("../models/Booking");
const Flight = require("../models/Flight");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const { generatePNR } = require("../utils/helpers");

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = asyncHandler(async (req, res, next) => {
  const {
    flightId,
    passengerName,
    passengerEmail,
    passengerPhone,
    seatNumber,
    journeyDate,
  } = req.body;

  // Get flight
  const flight = await Flight.findById(flightId);
  if (!flight) {
    return next(new ErrorResponse(`Flight not found with id ${flightId}`, 404));
  }

  // Check seat availability
  if (flight.availableSeats <= 0) {
    return next(new ErrorResponse("No seats available on this flight", 400));
  }

  // Check if seat is already booked
  const existingBooking = await Booking.findOne({
    flight: flightId,
    seatNumber,
    status: "confirmed",
    journeyDate: new Date(journeyDate).setHours(0, 0, 0, 0),
  });

  if (existingBooking) {
    return next(new ErrorResponse("Seat already booked", 400));
  }

  // Calculate total amount (including taxes)
  const basePrice = flight.currentPrice || flight.basePrice;
  const taxes = Math.round(basePrice * 0.15);
  const totalAmount = basePrice + taxes;

  // Check wallet balance and deduct amount
  const wallet = await Wallet.getOrCreateWallet(req.user.id);
  if (wallet.balance < totalAmount) {
    return next(
      new ErrorResponse(
        `Insufficient wallet balance. Required: ₹${totalAmount}, Available: ₹${wallet.balance}`,
        400
      )
    );
  }

  // Deduct amount from wallet
  await wallet.deductFunds(
    totalAmount,
    `Flight booking - ${flight.flightNumber} - Seat ${seatNumber}`
  );

  // Create booking
  const booking = await Booking.create({
    user: req.user.id,
    flight: flightId,
    passengerName,
    passengerEmail,
    passengerPhone,
    pnr: generatePNR(),
    seatNumber,
    journeyDate,
    amountPaid: totalAmount,
    status: "confirmed",
  });

  // Update available seats
  flight.availableSeats -= 1;
  await flight.save();

  // Add booking to user's bookings
  await User.findByIdAndUpdate(req.user.id, {
    $push: { bookings: booking._id },
  });

  // Populate flight data for response
  await booking.populate(
    "flight",
    "flightNumber airline departureCity arrivalCity departureTime arrivalTime"
  );

  res.status(201).json({
    success: true,
    data: booking,
  });
});

// @desc    Get all bookings for logged in user
// @route   GET /api/bookings
// @access  Private
exports.getBookings = asyncHandler(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id })
    .populate(
      "flight",
      "flightNumber airline departureCity arrivalCity departureTime arrivalTime"
    )
    .sort("-bookingDate");

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id).populate(
    "flight",
    "flightNumber airline departureCity arrivalCity departureTime arrivalTime"
  );

  if (!booking) {
    return next(
      new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the booking or is admin
  if (booking.user.toString() !== req.user.id && !req.user.isAdmin) {
    return next(
      new ErrorResponse(`Not authorized to access this booking`, 401)
    );
  }

  res.status(200).json({
    success: true,
    data: booking,
  });
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(
      new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the booking
  if (booking.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`Not authorized to cancel this booking`, 401)
    );
  }

  // Check if booking is already cancelled
  if (booking.status === "cancelled") {
    return next(new ErrorResponse("Booking is already cancelled", 400));
  }

  // Update booking status
  booking.status = "cancelled";
  await booking.save();

  // Update available seats
  await Flight.findByIdAndUpdate(booking.flight, {
    $inc: { availableSeats: 1 },
  });

  // Refund to wallet (90% refund)
  const refundAmount = Math.round(booking.amountPaid * 0.9);
  const wallet = await Wallet.getOrCreateWallet(req.user.id);
  await wallet.addFunds(refundAmount, `Refund for cancelled booking - PNR: ${booking.pnr}`);

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Generate ticket
// @route   GET /api/bookings/:id/ticket
// @access  Private
exports.generateTicket = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate("flight")
    .populate("user", "name email");

  if (!booking) {
    return next(
      new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the booking
  if (booking.user._id.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`Not authorized to access this booking`, 401)
    );
  }

  // Generate PDF ticket
  const ticket = {
    pnr: booking.pnr,
    passengerName: booking.passengerName,
    flightNumber: booking.flight.flightNumber,
    airline: booking.flight.airline,
    from: booking.flight.departureCity,
    to: booking.flight.arrivalCity,
    departureTime: booking.flight.departureTime,
    arrivalTime: booking.flight.arrivalTime,
    seatNumber: booking.seatNumber,
    journeyDate: booking.journeyDate,
    status: booking.status,
    amountPaid: booking.amountPaid,
  };

  // In a real app, you would generate a PDF here
  // For now, we'll return the ticket data
  res.status(200).json({
    success: true,
    data: ticket,
  });
});
