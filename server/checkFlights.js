const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Flight = require("./models/Flight");

// Load environment variables
dotenv.config({ path: __dirname + "/.env" });

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    console.log("MongoDB URI:", process.env.MONGO_URI ? "Found" : "Not found");

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ MongoDB Connected");

    // List all flights
    console.log("\nFetching flights...");
    const flights = await Flight.find({}).lean();

    if (flights.length === 0) {
      console.log("❌ No flights found in the database.");
      console.log("\nTo add a flight, you can use the following command:");
      console.log(`
  curl -X POST http://localhost:5000/api/flights \
    -H "Content-Type: application/json" \
    -d '{
      "flightNumber": "AI101",
      "airline": "Air India",
      "departureCity": "Mumbai",
      "arrivalCity": "Delhi",
      "departureTime": "2025-01-01T08:00:00.000Z",
      "arrivalTime": "2025-01-01T10:30:00.000Z",
      "basePrice": 5000,
      "currentPrice": 5000,
      "totalSeats": 100,
      "availableSeats": 100
    }'`);
    } else {
      console.log(`✅ Found ${flights.length} flights in the database:\n`);
      console.table(
        flights.map((f) => ({
          Flight: f.flightNumber,
          Airline: f.airline,
          From: f.departureCity,
          To: f.arrivalCity,
          Departure: new Date(f.departureTime).toLocaleString(),
          Price: f.currentPrice,
        }))
      );
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    if (err.name === "MongooseServerSelectionError") {
      console.log("\n🔍 Troubleshooting Tips:");
      console.log("1. Check if your MongoDB Atlas cluster is running");
      console.log("2. Verify your IP is whitelisted in MongoDB Atlas");
      console.log("3. Check your MONGO_URI in the .env file");
      console.log("4. Ensure your internet connection is stable");
    }
    process.exit(1);
  }
};

connectDB();
