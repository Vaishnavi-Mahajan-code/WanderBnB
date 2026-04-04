const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError.js");

const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// Routes
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const users = require("./routes/user.js");
const dashboardRoutes = require("./routes/dashboard.js"); // ✅ dashboard
const bookingRoutes = require("./routes/booking.js");

const Mongo_url = "mongodb://127.0.0.1:27017/wanderlust";

// =======================
// Database Connection
// =======================
async function main() {
  await mongoose.connect(Mongo_url);
}

main()
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.log("❌ MongoDB error:", err));

// =======================
// View Engine Setup
// =======================
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride("_method"));

// =======================
// Session Configuration
// =======================
const sessionOptions = {
  secret: "wanderbnb-super-secret-2026",
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// =======================
// Passport Configuration
// =======================
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// =======================
// Global Locals Middleware
// =======================
app.use((req, res, next) => {
  res.locals.currUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// =======================
// Routes
// =======================
app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);
app.use("/", users);

// ✅ DASHBOARD ROUTE (FIXED POSITION)
app.use("/", dashboardRoutes);
// ✅ booking ROUTE (FIXED POSITION)
app.use("/bookings", bookingRoutes);

// =======================
// 404 Handler
// =======================
app.use("/*path", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// =======================
// Error Handler
// =======================
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something Went Wrong!" } = err;
  console.error(err);
  res.status(statusCode).render("error", { err });
});

// =======================
// Server Start
// =======================
app.listen(8080, () => {
  console.log("🚀 Server running on http://localhost:8080");
});
