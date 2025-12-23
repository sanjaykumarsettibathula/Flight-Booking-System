// store-flights.js
const { MongoClient } = require("mongodb");

// Your 20 flights data
const flights = [
  {
    flight_id: "JAL101",
    airline: "Japan Airlines",
    departure_city: "Tokyo",
    arrival_city: "Osaka",
    base_price: 2500,
    current_price: 2500,
    departure_time: new Date("2025-12-25T08:00:00.000Z"),
    arrival_time: new Date("2025-12-25T09:30:00.000Z"),
    available_seats: 120,
  },
  {
    flight_id: "ANA202",
    airline: "ANA All Nippon Airways",
    departure_city: "Tokyo",
    arrival_city: "Sapporo",
    base_price: 2800,
    current_price: 2800,
    departure_time: new Date("2025-12-25T10:00:00.000Z"),
    arrival_time: new Date("2025-12-25T12:00:00.000Z"),
    available_seats: 150,
  },
  {
    flight_id: "JAL303",
    airline: "Japan Airlines",
    departure_city: "Osaka",
    arrival_city: "Fukuoka",
    base_price: 2300,
    current_price: 2300,
    departure_time: new Date("2025-12-26T09:00:00.000Z"),
    arrival_time: new Date("2025-12-26T10:15:00.000Z"),
    available_seats: 100,
  },
  {
    flight_id: "SKY404",
    airline: "Skymark Airlines",
    departure_city: "Nagoya",
    arrival_city: "Tokyo",
    base_price: 2200,
    current_price: 2200,
    departure_time: new Date("2025-12-26T14:00:00.000Z"),
    arrival_time: new Date("2025-12-26T15:10:00.000Z"),
    available_seats: 80,
  },
  {
    flight_id: "PEA505",
    airline: "Peach Aviation",
    departure_city: "Fukuoka",
    arrival_city: "Okinawa",
    base_price: 3000,
    current_price: 3000,
    departure_time: new Date("2025-12-27T11:00:00.000Z"),
    arrival_time: new Date("2025-12-27T13:30:00.000Z"),
    available_seats: 180,
  },
  {
    flight_id: "JET606",
    airline: "Jetstar Japan",
    departure_city: "Sapporo",
    arrival_city: "Tokyo",
    base_price: 2700,
    current_price: 2700,
    departure_time: new Date("2025-12-27T16:00:00.000Z"),
    arrival_time: new Date("2025-12-27T18:00:00.000Z"),
    available_seats: 200,
  },
  {
    flight_id: "ANA707",
    airline: "ANA All Nippon Airways",
    departure_city: "Hiroshima",
    arrival_city: "Osaka",
    base_price: 2100,
    current_price: 2100,
    departure_time: new Date("2025-12-28T07:30:00.000Z"),
    arrival_time: new Date("2025-12-28T08:45:00.000Z"),
    available_seats: 90,
  },
  {
    flight_id: "JAL808",
    airline: "Japan Airlines",
    departure_city: "Sendai",
    arrival_city: "Nagoya",
    base_price: 2600,
    current_price: 2600,
    departure_time: new Date("2025-12-28T12:00:00.000Z"),
    arrival_time: new Date("2025-12-28T13:30:00.000Z"),
    available_seats: 110,
  },
  {
    flight_id: "SKY909",
    airline: "Skymark Airlines",
    departure_city: "Kagoshima",
    arrival_city: "Tokyo",
    base_price: 2900,
    current_price: 2900,
    departure_time: new Date("2025-12-29T09:00:00.000Z"),
    arrival_time: new Date("2025-12-29T11:15:00.000Z"),
    available_seats: 70,
  },
  {
    flight_id: "PEA1010",
    airline: "Peach Aviation",
    departure_city: "Okinawa",
    arrival_city: "Fukuoka",
    base_price: 2950,
    current_price: 2950,
    departure_time: new Date("2025-12-29T14:00:00.000Z"),
    arrival_time: new Date("2025-12-29T16:30:00.000Z"),
    available_seats: 160,
  },
  {
    flight_id: "JAL1111",
    airline: "Japan Airlines",
    departure_city: "Tokyo",
    arrival_city: "Hiroshima",
    base_price: 2750,
    current_price: 2750,
    departure_time: new Date("2025-12-30T08:30:00.000Z"),
    arrival_time: new Date("2025-12-30T10:00:00.000Z"),
    available_seats: 95,
  },
  {
    flight_id: "ANA1212",
    airline: "ANA All Nippon Airways",
    departure_city: "Osaka",
    arrival_city: "Sapporo",
    base_price: 3100,
    current_price: 3100,
    departure_time: new Date("2025-12-30T13:00:00.000Z"),
    arrival_time: new Date("2025-12-30T15:30:00.000Z"),
    available_seats: 130,
  },
  {
    flight_id: "JET1313",
    airline: "Jetstar Japan",
    departure_city: "Nagoya",
    arrival_city: "Fukuoka",
    base_price: 2400,
    current_price: 2400,
    departure_time: new Date("2025-12-31T10:00:00.000Z"),
    arrival_time: new Date("2025-12-31T11:45:00.000Z"),
    available_seats: 140,
  },
  {
    flight_id: "SKY1414",
    airline: "Skymark Airlines",
    departure_city: "Fukuoka",
    arrival_city: "Sendai",
    base_price: 2850,
    current_price: 2850,
    departure_time: new Date("2025-12-31T15:00:00.000Z"),
    arrival_time: new Date("2025-12-31T17:15:00.000Z"),
    available_seats: 85,
  },
  {
    flight_id: "PEA1515",
    airline: "Peach Aviation",
    departure_city: "Sapporo",
    arrival_city: "Kagoshima",
    base_price: 3200,
    current_price: 3200,
    departure_time: new Date("2026-01-01T07:00:00.000Z"),
    arrival_time: new Date("2026-01-01T10:30:00.000Z"),
    available_seats: 170,
  },
  {
    flight_id: "JAL1616",
    airline: "Japan Airlines",
    departure_city: "Tokyo",
    arrival_city: "Sendai",
    base_price: 2250,
    current_price: 2250,
    departure_time: new Date("2026-01-01T11:00:00.000Z"),
    arrival_time: new Date("2026-01-01T12:15:00.000Z"),
    available_seats: 105,
  },
  {
    flight_id: "ANA1717",
    airline: "ANA All Nippon Airways",
    departure_city: "Osaka",
    arrival_city: "Kagoshima",
    base_price: 2650,
    current_price: 2650,
    departure_time: new Date("2026-01-02T09:00:00.000Z"),
    arrival_time: new Date("2026-01-02T11:00:00.000Z"),
    available_seats: 125,
  },
  {
    flight_id: "JET1818",
    airline: "Jetstar Japan",
    departure_city: "Hiroshima",
    arrival_city: "Nagoya",
    base_price: 2350,
    current_price: 2350,
    departure_time: new Date("2026-01-02T14:00:00.000Z"),
    arrival_time: new Date("2026-01-02T15:30:00.000Z"),
    available_seats: 155,
  },
  {
    flight_id: "SKY1919",
    airline: "Skymark Airlines",
    departure_city: "Kagoshima",
    arrival_city: "Osaka",
    base_price: 3050,
    current_price: 3050,
    departure_time: new Date("2026-01-03T10:00:00.000Z"),
    arrival_time: new Date("2026-01-03T12:00:00.000Z"),
    available_seats: 75,
  },
  {
    flight_id: "PEA2020",
    airline: "Peach Aviation",
    departure_city: "Sendai",
    arrival_city: "Okinawa",
    base_price: 3150,
    current_price: 3150,
    departure_time: new Date("2026-01-03T16:00:00.000Z"),
    arrival_time: new Date("2026-01-03T19:00:00.000Z"),
    available_seats: 190,
  },
];

// REPLACE THIS WITH YOUR ACTUAL CONNECTION STRING FROM MONGODB ATLAS
const connectionString =
  "mongodb+srv://username:password@cluster0.mongodb.net/flightbooking?retryWrites=true&w=majority";

async function storeDataInCloud() {
  console.log("📡 Connecting to MongoDB Cloud (Atlas)...");

  const client = new MongoClient(connectionString);

  try {
    // Connect to MongoDB Cloud
    await client.connect();
    console.log("✅ Connected to MongoDB Cloud!");

    // Get database and collection
    const database = client.db("flightbooking");
    const collection = database.collection("flights");

    // Delete existing flights (if any)
    await collection.deleteMany({});
    console.log("🗑️  Cleared existing flights");

    // Insert 20 flights into cloud
    const result = await collection.insertMany(flights);
    console.log(
      `✅ SUCCESS: Stored ${result.insertedCount} flights in MongoDB Cloud!`
    );

    // Verify the data
    const count = await collection.countDocuments();
    console.log(`📊 Total flights in cloud: ${count}`);

    console.log("\n🎉 Your data is now stored in MongoDB Cloud (Atlas)!");
    console.log("🌐 Data will persist even when your app is not running");
    console.log("🔗 Accessible from anywhere with the connection string");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.log("\n🔧 Fix connection string in the code!");
  } finally {
    await client.close();
  }
}

storeDataInCloud();
