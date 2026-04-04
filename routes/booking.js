const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const { isLoggedIn } = require("../middleware");

// ================= CREATE BOOKING =================
router.post("/:id", isLoggedIn, async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  const newBooking = new Booking({
    listing: listing._id,
    user: req.user._id,
  });

  await newBooking.save();

  req.flash("success", "Booking successful!");
  res.redirect("/dashboard"); // ✅ same page
});

// ================= CANCEL BOOKING =================
router.delete("/:bookingId", isLoggedIn, async (req, res) => {
  const { bookingId } = req.params;

  await Booking.findByIdAndDelete(bookingId);

  req.flash("success", "Booking cancelled!");
  res.redirect("/dashboard"); // ✅ back to dashboard
});

module.exports = router;
