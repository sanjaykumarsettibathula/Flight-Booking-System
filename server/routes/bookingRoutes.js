const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createBooking,
  getBookings,
  getBooking,
  cancelBooking,
  generateTicket,
} = require("../controllers/bookingController");

// Protected routes
router.use(protect);
router.post("/", createBooking);
router.get("/", getBookings);
router.get("/:id", getBooking);
router.put("/:id/cancel", cancelBooking);
router.get("/:id/ticket", generateTicket);

module.exports = router;
