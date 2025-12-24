const Flight = require("../models/Flight");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

// @desc    Get all flights
// @route   GET /api/flights
// @access  Public
exports.getFlights = asyncHandler(async (req, res, next) => {
  const flights = await Flight.find().sort("departureTime");

  res.status(200).json({
    success: true,
    count: flights.length,
    data: flights,
  });
});

// @desc    Get single flight
// @route   GET /api/flights/:id
// @access  Public
exports.getFlight = asyncHandler(async (req, res, next) => {
  const flight = await Flight.findById(req.params.id);

  if (!flight) {
    return next(
      new ErrorResponse(`Flight not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: flight });
});

// @desc    Create new flight
// @route   POST /api/flights
// @access  Private/Admin
exports.createFlight = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  const flight = await Flight.create(req.body);

  res.status(201).json({
    success: true,
    data: flight,
  });
});

// @desc    Update flight
// @route   PUT /api/flights/:id
// @access  Private/Admin
exports.updateFlight = asyncHandler(async (req, res, next) => {
  let flight = await Flight.findById(req.params.id);

  if (!flight) {
    return next(
      new ErrorResponse(`Flight not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is flight owner or admin
  if (flight.user.toString() !== req.user.id && !req.user.isAdmin) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this flight`,
        401
      )
    );
  }

  flight = await Flight.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: flight });
});

// @desc    Delete flight
// @route   DELETE /api/flights/:id
// @access  Private/Admin
exports.deleteFlight = asyncHandler(async (req, res, next) => {
  const flight = await Flight.findById(req.params.id);

  if (!flight) {
    return next(
      new ErrorResponse(`Flight not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is flight owner or admin
  if (flight.user.toString() !== req.user.id && !req.user.isAdmin) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this flight`,
        401
      )
    );
  }

  await Flight.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true, data: {} });
});

// @desc    Search flights
// @route   GET /api/flights/search
// @access  Public
exports.searchFlights = asyncHandler(async (req, res, next) => {
  const { departure, arrival, date, passengers = 1 } = req.query;

  if (!departure || !arrival || !date) {
    return next(
      new ErrorResponse("Please provide departure, arrival and date", 400)
    );
  }

  // Parse the date
  const departureDate = new Date(date);
  const nextDay = new Date(departureDate);
  nextDay.setDate(nextDay.getDate() + 1);

  // Build query
  const query = {
    departureCity: new RegExp(departure, "i"),
    arrivalCity: new RegExp(arrival, "i"),
    departureTime: {
      $gte: departureDate,
      $lt: nextDay,
    },
    availableSeats: { $gte: parseInt(passengers) },
  };

  // Execute query
  const flights = await Flight.find(query).sort("departureTime").limit(10); // Return maximum 10 flights as per requirement

  // Update prices based on demand
  const updatedFlights = await Promise.all(
    flights.map((flight) => flight.updatePrice())
  );

  res.status(200).json({
    success: true,
    count: updatedFlights.length,
    data: updatedFlights,
  });
});

// @desc    Track flight price
// @route   GET /api/flights/:id/price
// @access  Public
exports.trackPrice = asyncHandler(async (req, res, next) => {
  const flight = await Flight.findById(req.params.id);

  if (!flight) {
    return next(
      new ErrorResponse(`Flight not found with id of ${req.params.id}`, 404)
    );
  }

  // Update price based on demand
  const updatedFlight = await flight.updatePrice();

  res.status(200).json({
    success: true,
    data: {
      flightId: updatedFlight._id,
      currentPrice: updatedFlight.currentPrice,
      basePrice: updatedFlight.basePrice,
      lastPriceUpdate: updatedFlight.lastPriceUpdate,
      isSurgePricing: updatedFlight.currentPrice > updatedFlight.basePrice,
    },
  });
});

// @desc    Add booking attempt (for surge pricing)
// @route   POST /api/flights/:id/attempt
// @access  Private
exports.addBookingAttempt = asyncHandler(async (req, res, next) => {
  const flight = await Flight.findById(req.params.id);

  if (!flight) {
    return next(
      new ErrorResponse(`Flight not found with id of ${req.params.id}`, 404)
    );
  }

  // Add booking attempt
  await flight.addBookingAttempt(req.user.id);

  // Update price based on demand
  const updatedFlight = await flight.updatePrice();

  res.status(200).json({
    success: true,
    data: {
      flightId: updatedFlight._id,
      currentPrice: updatedFlight.currentPrice,
      basePrice: updatedFlight.basePrice,
      lastPriceUpdate: updatedFlight.lastPriceUpdate,
    },
  });
});
