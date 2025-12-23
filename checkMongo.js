const mongoose = require("mongoose");
require("dotenv").config();

async function checkMongo() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Successfully connected to MongoDB");

    // Get the database name from the connection string
    const dbName = mongoose.connection.name;
    console.log(`Using database: ${dbName}`);

    // List all collections
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log("\nCollections in the database:");
    collections.forEach((collection) => {
      console.log(`- ${collection.name}`);
    });

    // Check if flights collection exists
    const hasFlights = collections.some(
      (collection) => collection.name === "flights"
    );

    if (hasFlights) {
      // Get count of flights
      const Flight = require("./server/models/Flight");
      const count = await Flight.countDocuments({});
      console.log(`\nTotal flights in database: ${count}`);

      // Get one flight as sample
      if (count > 0) {
        const flight = await Flight.findOne({});
        console.log("\nSample flight:");
        console.log(JSON.stringify(flight, null, 2));
      } else {
        console.log("No flights found in the flights collection.");
      }
    } else {
      console.log("No flights collection found in the database.");
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkMongo();
