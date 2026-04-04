const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true, // ✅ Add this
    },
    role: {
      type: String,
      enum: ["user", "host"],
      default: "user",
    },
    // 🔥 Profile Fields
    fullName: {
      type: String,
      trim: true, // ✅ Removes extra spaces
    },
    phone: {
      type: String,
      validate: {
        validator: (v) => !v || /^\+?\d{10,15}$/.test(v.replace(/\s/g, "")),
        message: "Invalid phone", // ✅ Validation
      },
    },
    bio: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    profileImage: {
      type: String,
      default: "https://via.placeholder.com/150?text=👤", // ✅ Nicer placeholder
    },
    // Host-specific fields
    experience: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // ✅ createdAt/updatedAt
  }
);

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
