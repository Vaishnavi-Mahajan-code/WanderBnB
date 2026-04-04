const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js"); // ✅ NEW
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");

// ================= DASHBOARD =================
router.get(
  "/dashboard",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    let listings = [];

    // HOST → show own listings
    if (req.user.role === "host") {
      listings = await Listing.find({ owner: req.user._id })
        .populate("reviews")
        .populate("owner")
        .sort({ createdAt: -1 });
    }

    // USER → show bookings
    if (req.user.role === "user") {
      listings = await Booking.find({ user: req.user._id })
        .populate("listing")
        .sort({ date: -1 });
    }

    res.render("listings/dashboard", {
      currUser: req.user,
      listings,
    });
  })
);

module.exports = router;
