const mongoose = require("mongoose");
const config = require("./server/config/config");
const Flight = require("./server/models/Flight");

async function checkFlights() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Count total flights
    const count = await Flight.countDocuments({});
    console.log(`Total flights in database: ${count}`);

    // Get a sample flight if available
    if (count > 0) {
      const flight = await Flight.findOne({}).limit(1);
      console.log("\nSample flight:");
      console.log(`Flight Number: ${flight.flightNumber}`);
      console.log(`From: ${flight.departureCity} (${flight.departureAirport})`);
      console.log(`To: ${flight.arrivalCity} (${flight.arrivalAirport})`);
      console.log(`Departure: ${flight.departureTime}`);
      console.log(`Arrival: ${flight.arrivalTime}`);
      console.log(`Price: $${flight.price}`);
      console.log(`Available Seats: ${flight.availableSeats}`);
    } else {
      console.log("No flights found in the database.");
    }

    // Close the connection
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkFlights();
