const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "The name field is a required field"],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  short_description: {
    type: String,
    required: [true, "The description field is required"],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  ratingCount: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, "The price field is a required field"],
  },
  image: {
    type: Object,
    required: [true, "You have to provide an image"],
    url: {
      type: String,
      required: [true],
    },
    public_id: {
      type: String,
      required: [true],
    },
  },
  gender: {
    type: String,
    required: [true, "The gender field is required"],
  },
});

module.exports = mongoose.model("Product", productSchema);
//Reviews field to be added and this will reference a review model (probably)
//size to be probably added
//name, category,short_description,price, image, gender
