const mongoose = require("mongoose");
require("dotenv").config();
const Flight = require("../models/Flight");

// Get dates for next 30 days
const today = new Date();
today.setHours(0, 0, 0, 0);

// Indian cities flights data
const flights = [
  {
    flightNumber: "AI101",
    airline: "Air India",
    departureCity: "Mumbai",
    arrivalCity: "Delhi",
    departureTime: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
    arrivalTime: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000 + 30 * 60 * 1000),
    basePrice: 2500,
    currentPrice: 2500,
    totalSeats: 100,
    availableSeats: 100,
  },
  {
    flightNumber: "SG202",
    airline: "SpiceJet",
    departureCity: "Delhi",
    arrivalCity: "Bangalore",
    departureTime: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000),
    arrivalTime: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000 + 30 * 60 * 1000),
    basePrice: 2800,
    currentPrice: 2800,
    totalSeats: 100,
    availableSeats: 100,
  },
  {
    flightNumber: "6E303",
    airline: "IndiGo",
    departureCity: "Mumbai",
    arrivalCity: "Chennai",
    departureTime: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000),
    arrivalTime: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000 + 15 * 60 * 1000),
    basePrice: 2300,
    currentPrice: 2300,
    totalSeats: 100,
    availableSeats: 100,
  },
  {
    flightNumber: "G8404",
    airline: "GoAir",
    departureCity: "Bangalore",
    arrivalCity: "Kolkata",
    departureTime: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000),
    arrivalTime: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000 + 30 * 60 * 1000),
    basePrice: 2200,
    currentPrice: 2200,
    totalSeats: 100,
    availableSeats: 100,
  },
  {
    flightNumber: "AI505",
    airline: "Air India",
    departureCity: "Delhi",
    arrivalCity: "Hyderabad",
    departureTime: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000),
    arrivalTime: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000),
    basePrice: 3000,
    currentPrice: 3000,
    totalSeats: 100,
    availableSeats: 100,
  },
  {
    flightNumber: "6E606",
    airline: "IndiGo",
    departureCity: "Chennai",
    arrivalCity: "Pune",
    departureTime: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000),
    arrivalTime: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000 + 30 * 60 * 1000),
    basePrice: 2700,
    currentPrice: 2700,
    totalSeats: 100,
    availableSeats: 100,
  },
  {
    flightNumber: "SG707",
    airline: "SpiceJet",
    departureCity: "Kolkata",
    arrivalCity: "Ahmedabad",
    departureTime: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000 + 30 * 60 * 1000),
    arrivalTime: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000),
    basePrice: 2100,
    currentPrice: 2100,
    totalSeats: 100,
    availableSeats: 100,
  },
  {
    flightNumber: "AI808",
    airline: "Air India",
    departureCity: "Hyderabad",
    arrivalCity: "Jaipur",
    departureTime: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000),
    arrivalTime: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000),
    basePrice: 2600,
    currentPrice: 2600,
    totalSeats: 100,
    availableSeats: 100,
  },
  {
    flightNumber: "6E909",
    airline: "IndiGo",
    departureCity: "Pune",
    arrivalCity: "Goa",
    departureTime: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000),
    arrivalTime: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000 + 15 * 60 * 1000),
    basePrice: 2900,
    currentPrice: 2900,
    totalSeats: 100,
    availableSeats: 100,
  },
  {
    flightNumber: "G81010",
    airline: "GoAir",
    departureCity: "Ahmedabad",
    arrivalCity: "Mumbai",
    departureTime: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000),
    arrivalTime: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000 + 30 * 60 * 1000),
    basePrice: 2950,
    currentPrice: 2950,
    totalSeats: 100,
    availableSeats: 100,
  },
  {
    flightNumber: "SG1111",
    airline: "SpiceJet",
    departureCity: "Jaipur",
    arrivalCity: "Delhi",
    departureTime: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000 + 30 * 60 * 1000),
    arrivalTime: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000 + 45 * 60 * 1000),
    basePrice: 2750,
    currentPrice: 2750,
    totalSeats: 100,
    availableSeats: 100,
  },
  {
    flightNumber: "AI1212",
    airline: "Air India",
    departureCity: "Goa",
    arrivalCity: "Bangalore",
    departureTime: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000),
    arrivalTime: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000 + 15 * 60 * 1000),
    basePrice: 3000,
    currentPrice: 3000,
    totalSeats: 100,
    availableSeats: 100,
  },
  {
    flightNumber: "6E1313",
    airline: "IndiGo",
    departureCity: "Mumbai",
    arrivalCity: "Kolkata",
    departureTime: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000),
    arrivalTime: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000 + 30 * 60 * 1000),
    basePrice: 2400,
    currentPrice: 2400,
    totalSeats: 100,
    availableSeats: 100,
  },
  {
    flightNumber: "G81414",
    airline: "GoAir",
    departureCity: "Delhi",
    arrivalCity: "Chennai",
    departureTime: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000),
    arrivalTime: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000 + 30 * 60 * 1000),
    basePrice: 2850,
    currentPrice: 2850,
    totalSeats: 100,
    availableSeats: 100,
  },
  {
    flightNumber: "SG1515",
    airline: "SpiceJet",
    departureCity: "Bangalore",
    arrivalCity: "Hyderabad",
    departureTime: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000),
    arrivalTime: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000 + 30 * 60 * 1000),
    basePrice: 3000,
    currentPrice: 3000,
    totalSeats: 100,
    availableSeats: 100,
  },
  {
    flightNumber: "AI1616",
    airline: "Air India",
    departureCity: "Chennai",
    arrivalCity: "Pune",
    departureTime: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000),
    arrivalTime: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000 + 30 * 60 * 1000),
    basePrice: 2250,
    currentPrice: 2250,
    totalSeats: 100,
    availableSeats: 100,
  },
  {
    flightNumber: "6E1717",
    airline: "IndiGo",
    departureCity: "Kolkata",
    arrivalCity: "Ahmedabad",
    departureTime: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000),
    arrivalTime: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000 + 30 * 60 * 1000),
    basePrice: 2650,
    currentPrice: 2650,
    totalSeats: 100,
    availableSeats: 100,
  },
  {
    flightNumber: "G81818",
    airline: "GoAir",
    departureCity: "Hyderabad",
    arrivalCity: "Jaipur",
    departureTime: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000),
    arrivalTime: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000),
    basePrice: 2350,
    currentPrice: 2350,
    totalSeats: 100,
    availableSeats: 100,
  },
  {
    flightNumber: "SG1919",
    airline: "SpiceJet",
    departureCity: "Pune",
    arrivalCity: "Goa",
    departureTime: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000),
    arrivalTime: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000 + 15 * 60 * 1000),
    basePrice: 3000,
    currentPrice: 3000,
    totalSeats: 100,
    availableSeats: 100,
  },
  {
    flightNumber: "AI2020",
    airline: "Air India",
    departureCity: "Ahmedabad",
    arrivalCity: "Mumbai",
    departureTime: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000),
    arrivalTime: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000 + 30 * 60 * 1000),
    basePrice: 3000,
    currentPrice: 3000,
    totalSeats: 100,
    availableSeats: 100,
  },
];

async function seedFlights() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/flightbooking";
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Clear existing flights
    await Flight.deleteMany({});
    console.log("🗑️  Cleared existing flights");

    // Insert flights
    const insertedFlights = await Flight.insertMany(flights);
    console.log(`✅ Successfully seeded ${insertedFlights.length} flights`);

    // Display summary
    const count = await Flight.countDocuments();
    console.log(`📊 Total flights in database: ${count}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding flights:", error);
    process.exit(1);
  }
}

seedFlights();

