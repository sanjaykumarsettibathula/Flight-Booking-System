const Booking = require("../models/Booking");
const Flight = require("../models/Flight");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const { generatePNR } = require("../utils/helpers");
const PDFDocument = require("pdfkit");

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
    seatNumbers = [],
    passengerCount: passengerCountRaw,
    journeyDate,
  } = req.body;

  // Get flight
  const flight = await Flight.findById(flightId);
  if (!flight) {
    return next(new ErrorResponse(`Flight not found with id ${flightId}`, 404));
  }

  // Determine passenger count and seat selection
  const normalizedSeatNumbers = Array.isArray(seatNumbers)
    ? seatNumbers.filter(Boolean)
    : [];
  const passengerCount =
    passengerCountRaw ||
    (normalizedSeatNumbers.length > 0 ? normalizedSeatNumbers.length : 1);

  // Check seat availability
  if (flight.availableSeats < passengerCount) {
    return next(new ErrorResponse("No seats available on this flight", 400));
  }

  // Check if seat is already booked (only if specific seats provided)
  if (normalizedSeatNumbers.length) {
    const existingBooking = await Booking.findOne({
      flight: flightId,
      status: "confirmed",
      journeyDate: new Date(journeyDate).setHours(0, 0, 0, 0),
      seatNumbers: { $in: normalizedSeatNumbers },
    });

    if (existingBooking) {
      return next(new ErrorResponse("One or more seats already booked", 400));
    }
  }

  // Calculate total amount (including taxes)
  const basePrice = flight.currentPrice || flight.basePrice;
  const taxes = Math.round(basePrice * 0.15) * passengerCount;
  const totalAmount = (basePrice * passengerCount) + taxes;

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
    `Flight booking - ${flight.flightNumber} - Seats ${passengerCount}`
  );

  // If no specific seats provided, auto-assign seats (simple allocator)
  const finalSeatNumbers =
    normalizedSeatNumbers.length > 0
      ? normalizedSeatNumbers
      : Array.from({ length: passengerCount }).map(
          (_, idx) => `A${Math.floor(Math.random() * 30) + 1 + idx}`
        );

  // Create booking
  const booking = await Booking.create({
    user: req.user.id,
    flight: flightId,
    passengerName,
    passengerEmail,
    passengerPhone,
    pnr: generatePNR(),
    seatNumber: finalSeatNumbers[0],
    seatNumbers: finalSeatNumbers,
    passengerCount,
    journeyDate,
    amountPaid: totalAmount,
    status: "confirmed",
  });

  // Update available seats
  flight.availableSeats -= passengerCount;
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
    $inc: { availableSeats: booking.passengerCount || 1 },
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

// @desc    Generate ticket (PDF)
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

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks = [];

  doc.on("data", (chunk) => chunks.push(chunk));
  doc.on("end", () => {
    const pdfBuffer = Buffer.concat(chunks);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="ticket-${booking.pnr}.pdf"`
    );
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdfBuffer);
  });

  // Header
  doc
    .fontSize(20)
    .text("Flight Ticket", { align: "center" })
    .moveDown(0.5);
  doc
    .fontSize(12)
    .text(`PNR: ${booking.pnr}`, { align: "center" })
    .moveDown(1.5);

  // Passenger & Booking
  doc.fontSize(12).text(`Passenger: ${booking.passengerName}`);
  doc.text(`Email: ${booking.passengerEmail || booking.user.email || ""}`);
  doc.text(`Phone: ${booking.passengerPhone || ""}`);
  doc.text(
    `Booking Date: ${new Date(booking.bookingDate || booking.createdAt).toLocaleString()}`
  );
  doc.text(
    `Journey Date: ${new Date(booking.journeyDate).toLocaleDateString()}`
  );
  doc.moveDown();

  // Flight details
  doc.fontSize(14).text("Flight Details", { underline: true }).moveDown(0.5);
  doc.fontSize(12).text(`Airline: ${booking.flight.airline}`);
  doc.text(`Flight: ${booking.flight.flightNumber}`);
  doc.text(
    `Route: ${booking.flight.departureCity} → ${booking.flight.arrivalCity}`
  );
  doc.text(
    `Departure: ${new Date(
      booking.flight.departureTime
    ).toLocaleString()} | Arrival: ${new Date(
      booking.flight.arrivalTime
    ).toLocaleString()}`
  );
  doc.text(
    `Seats: ${(booking.seatNumbers && booking.seatNumbers.join(", ")) || booking.seatNumber || "Auto-assigned"}`
  );
  doc.text(`Passengers: ${booking.passengerCount || 1}`);
  doc.moveDown();

  // Payment
  doc.fontSize(14).text("Payment", { underline: true }).moveDown(0.5);
  doc.fontSize(12).text(`Amount Paid: ₹${booking.amountPaid}`);
  doc.text(`Status: ${booking.status}`);

  doc.end();
});
