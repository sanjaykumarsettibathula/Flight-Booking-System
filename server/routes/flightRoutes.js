const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getFlights,
  getFlight,
  createFlight,
  updateFlight,
  deleteFlight,
  searchFlights,
  trackPrice,
  addBookingAttempt,
} = require("../controllers/flightController");

// Public routes
router.get("/", getFlights);
router.get("/search", searchFlights);
router.get("/:id", getFlight);
router.get("/:id/price", trackPrice);

// Protected routes (admin only)
router.use(protect);
router.post("/:id/attempt", addBookingAttempt);
router.post("/", createFlight);
router.put("/:id", updateFlight);
router.delete("/:id", deleteFlight);

module.exports = router;
