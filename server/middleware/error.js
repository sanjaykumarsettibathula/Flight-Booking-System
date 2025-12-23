const ErrorResponse = require("../utils/errorResponse");

// Centralized error handler for Express
// Ensures all errors are returned in a consistent JSON format
const errorHandler = (err, req, res, next) => {
  console.error(err.stack || err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Server Error";

  // Handle bad ObjectId
  if (err.name === "CastError") {
    message = "Resource not found";
    statusCode = 404;
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    statusCode = 400;
  }

  // Handle duplicate key errors
  if (err.code === 11000) {
    message = "Duplicate field value entered";
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
