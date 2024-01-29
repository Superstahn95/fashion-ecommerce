const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "User is required"],
    ref: "User",
  },
  refreshToken: {
    type: String,
    required: [true, "Token is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  expiredAt: {
    type: Date,
  },
});

module.exports = mongoose.model("Token", tokenSchema);
