const cloudinary = require("../utils/cloudinary");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const CustomError = require("../utils/customError");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");

//public route
exports.getProducts = asyncErrorHandler(async (req, res, next) => {
  //need to employ pagination
  // need to use the limit method
  const { pageNo = 0, limit = 10 } = req.query;
  console.log("we are here");
  const products = await Product.find()
    .sort({ createdAt: -1 })
    .skip(parseInt(pageNo))
    .limit(parseInt(limit))
    .populate("category");
  res.status(200).json({
    status: "success",
    products,
  });
});

//to be protected in time
exports.createProduct = asyncErrorHandler(async (req, res, next) => {
  const { category: category_id } = req.body;
  // we can also put each of these products in a collection though

  const product = new Product(req.body);

  const file = req.file;
  if (file) {
    const { secure_url: url, public_id } = await cloudinary.uploader.upload(
      file.path
    );
    product.image = { url, public_id };
  }
  await product.save();

  //update the category with the id in the req.body
  await Category.findByIdAndUpdate(category_id, {
    $push: { products: product._id },
  });

  res.status(200).json({
    status: "success",
    message: "Product has been added to log",
    product,
  });
});

//public route
exports.getProduct = asyncErrorHandler(async (req, res, next) => {
  //we can get a particular product using it's id that will be passed to params
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    const err = new CustomError("No such product", 404);
    return next(err);
  }
  res.status(200).json({
    status: "success",
    product,
  });
});

//private route
exports.deleteProduct = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    const err = new CustomError("No such product found", 404);
    return next(err);
  }
  const { category: categoryId } = product;
  if (product.image) {
    //delete from cloudinary
    const { public_id } = product.image;
    await cloudinary.uploader.destroy(public_id);
  }
  await Product.findByIdAndDelete(id);
  //after deleting product, we wish to clear that product id from the products field array in the category model
  await Category.findByIdAndUpdate(
    categoryId,
    { $pull: { products: id } },
    { new: true }
  ); //test functionality
  res.status(200).json({
    status: "success",
    message: "Product has been deleted",
  });
});

exports.updateProduct = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const { file } = req;
  const product = await Product.findById(id);
  if (!product) {
    const err = new CustomError("There is no such product", 404);
    next(err);
  }
  let updatedProduct = await Product.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true }
  );
  if (file) {
    if (product.image) {
      const { public_id: imageId } = product.image;
      await cloudinary.uploader.destroy(imageId);
      console.log("previous entry deleted");
    }
    //upload a new one
    const { secure_url: url, public_id } = await cloudinary.uploader.upload(
      file.path
    );
    console.log("last cloudinary updated");
    //update the database
    // updatedPost = await Product.findByIdAndUpdate(
    //   id,
    //   { image: { url, public_id } },
    //   { new: true }
    // );
    updatedProduct.image = { url, public_id };
    await updatedProduct.save();
    console.log("image updated");
  }
  //what happens to the category model if we decide to change the category of an item?? => fix this
  res.status(200).json({
    status: "success",
    message: "product has been uploaded",
    product: updatedProduct,
  });
});
