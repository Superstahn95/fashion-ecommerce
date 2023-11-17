const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, "Enter collection name"],
  },
  image: {
    type: Object,
    url: {
      type: URL,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
});

module.exports = mongoose.model("Collection", collectionSchema);
