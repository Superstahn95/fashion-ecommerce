const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "A reference to the product is required"],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "User is required"],
  },
  value: {
    type: Number,
    required: [true, "value cannot be empty"],
    min: 1,
    max: 5,
  },
});

module.exports = mongoose.model("Rating", ratingSchema);
