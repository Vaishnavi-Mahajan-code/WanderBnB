// middleware.js (in ROOT folder, same level as app.js)
const Listing = require("./models/listing.js"); // ✅ Fixed: ./models/
const Review = require("./models/review.js"); // ✅ Fixed: ./models/
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schemas.js"); // ✅ Fixed filename

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in first!");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session && req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
    delete req.session.redirectUrl;
  }
  next();
};

// ✅ FIXED: Use req.user (available after passport.session())
module.exports.isOwner = async (req, res, next) => {
  try {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }
    if (!listing.owner.equals(req.user._id)) {
      req.flash("error", "You are not the owner of this listing!");
      return res.redirect(`/listings/${id}`);
    }
    res.locals.listing = listing;
    next();
  } catch (err) {
    req.flash("error", "Server error!");
    res.redirect("/listings");
  }
};

// ✅ Review owner middleware
module.exports.isReviewOwner = async (req, res, next) => {
  try {
    let { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
      req.flash("error", "Review not found!");
      return res.redirect(`/listings/${id}`);
    }
    if (!review.author.equals(req.user._id)) {
      req.flash("error", "You can only delete your own reviews!");
      return res.redirect(`/listings/${id}`);
    }
    next();
  } catch (err) {
    req.flash("error", "Server error!");
    res.redirect("/listings");
  }
};

module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }
  next();
};

module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }
  next();
};
module.exports.isHost = (req, res, next) => {
  if (!req.user || req.user.role !== "host") {
    req.flash("error", "Only hosts can perform this action!");
    return res.redirect("/listings");
  }
  next();
};
