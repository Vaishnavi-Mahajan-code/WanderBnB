// init/index.js
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js"); // ✅ ADDED THIS LINE

const Mongo_url = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("✅ Connected to DB");
  })
  .catch((err) => {
    console.log("❌ DB Error:", err);
  });

async function main() {
  await mongoose.connect(Mongo_url);
}

const initDB = async () => {
  try {
    await Listing.deleteMany({});

    // ✅ Create 5 demo hosts
    const demoHosts = await Promise.all([
      User.register(
        new User({ username: "beachlover_raj", email: "raj@wanderbnb.com" }),
        "raj123"
      ),
      User.register(
        new User({ username: "hillgirl_priya", email: "priya@wanderbnb.com" }),
        "priya123"
      ),
      User.register(
        new User({ username: "desertking_vik", email: "vik@wanderbnb.com" }),
        "vik123"
      ),
      User.register(
        new User({ username: "lakequeen_maya", email: "maya@wanderbnb.com" }),
        "maya123"
      ),
      User.register(
        new User({ username: "citystar_neha", email: "neha@wanderbnb.com" }),
        "neha123"
      ),
    ]);

    // ✅ Assign hosts to listings (rotate through 5 hosts)
    const listingsWithHosts = initData.data.map((listing, index) => ({
      ...listing,
      owner: demoHosts[index % demoHosts.length]._id,
    }));

    await Listing.insertMany(listingsWithHosts);
    console.log(
      `✅ ${demoHosts.length} demo hosts + ${listingsWithHosts.length} listings created!`
    );
  } catch (error) {
    console.error("❌ Init error:", error);
  } finally {
    mongoose.connection.close();
  }
};

initDB();
