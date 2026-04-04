const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing");
const {
  validateReview,
  isLoggedIn,
  isReviewOwner,
} = require("../middleware.js");

// ✅ FIXED: Added isLoggedIn to delete route + isReviewOwner
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    listing.reviews.push(newReview._id);
    await newReview.save();
    await listing.save();

    req.flash("success", "Review created successfully!");
    res.redirect(`/listings/${listing._id}`);
  })
);

// ✅ FIXED: Added proper authorization
router.delete(
  "/:reviewId",
  isLoggedIn, // Must be logged in
  isReviewOwner, // Must be review owner
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted successfully!");
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
