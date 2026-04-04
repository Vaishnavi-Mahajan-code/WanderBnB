const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const mongoose = require("mongoose");

const {
  isLoggedIn,
  isOwner,
  isHost,
  validateListing,
} = require("../middleware.js");

// ================= INDEX ROUTE =================
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
  })
);

// ================= NEW ROUTE =================
router.get("/new", isLoggedIn, isHost, (req, res) => {
  res.render("listings/new.ejs");
});

// ================= CREATE ROUTE =================
router.post(
  "/",
  isLoggedIn,
  isHost,
  validateListing,
  wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    await newListing.save();

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  })
);

// ================= SHOW ROUTE =================
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;

    // ✅ Prevent crash (IMPORTANT FIX)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash("error", "Invalid Listing ID!");
      return res.redirect("/listings");
    }

    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: { path: "author" },
      })
      .populate("owner");

    if (!listing) {
      req.flash("error", "Listing does not exist!");
      return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
  })
);

// ================= EDIT ROUTE =================
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.redirect("/listings");
    }

    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    res.render("listings/edit", { listing });
  })
);

// ================= UPDATE ROUTE =================
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.redirect("/listings");
    }

    await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  })
);

// ================= DELETE ROUTE =================
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.redirect("/listings");
    }

    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
  })
);

module.exports = router;
