const mongoose = require("mongoose");

const tokenSchema = new mongoose.model({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "User is required"],
    ref: User,
  },
  refreshToken: {
    type: mongoose.Schema.Types.ObjectId,
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
