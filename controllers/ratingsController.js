const asyncErrorHandler = require("../utils/asyncErrorHandler");
const CustomError = require("../utils/customError");
const Rating = require("../models/ratingsModel");
const Product = require("../models/productModel");

exports.submitRating = asyncErrorHandler(async (req, res, next) => {
  const { productId } = req.params;
  //get the product with that productId
  const product = await Product.findById(productId);
  if (!product) {
    const err = new CustomError("Product not found", 404);
    return next(err);
  }
  //for now, i will be getting the userId from the body but that is definitely subject to change
  const { userId, value } = req.body;
  const newRating = new Rating({
    productId,
    userId,
    value,
  });
  await newRating.save();
  product.ratings =
    (product.ratings * product.ratingCount + value) / product.ratingCount + 1;
  product.ratingCount += 1;
  await product.save();

  res.status(201).json({
    status: "success",
    message: "Rating submitted",
    product,
  });
});
