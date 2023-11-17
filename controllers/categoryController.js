const CustomError = require("../utils/customError");
const cloudinary = require("../utils/cloudinary");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const asyncErrorHandler = require("../utils/asyncErrorHandler");

exports.getCategories = asyncErrorHandler(async (req, res, next) => {
  const categories = await Category.find().populate("products");
  res.status(200).json({
    status: "success",
    categories,
  });
});

exports.createCategory = asyncErrorHandler(async (req, res, next) => {
  const { file } = req;
  const category = new Category(req.body);
  if (file) {
    const { secure_url: url, public_id } = await cloudinary.uploader.upload(
      file.path
    );
    category.image = { url, public_id };
  }
  await category.save();
  res.status(200).json({
    status: "success",
    category,
  });
});

exports.updateCategory = asyncErrorHandler(async (req, res) => {
  const { file } = req;
  const { id } = req.params;
  const category = await Category.findById(id);
  if (!category) {
    const err = new CustomError("No product found", 404);
    return next(err);
  }
  let updatedCategory = await Category.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true }
  );

  if (file) {
    const { public_id: imageId } = updatedCategory.image;
    await cloudinary.uploader.destroy(imageId);

    const { secure_url: url, public_id } = await cloudinary.uploader.upload(
      file.path
    );
    // updatedCategory = await Category.findByIdAndUpdate(
    //   id,
    //   { image: { url, public_id } },
    //   { new: true }
    // );
    updatedCategory.image = { url, public_id };
    await updatedCategory.save();
  }

  res.status(200).json({
    status: "success",
    category: updatedCategory,
  });
});

//yet to test this
exports.deleteCategory = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const category = await Category.findById(id);
  const products = await Product.find({ category: id }); //:string[]
  if (!category) {
    const err = new CustomError("There is no such category", 404);
    return next(err);
  }
  //before deleting a category, we wish to clear the category from existing products
  await Category.findByIdAndDelete(id);
  if (products && products.length > 0) {
    const updateProductsPromises = products.map(async (product) => {
      product.category = null;
      await product.save();
    });
    await Promise.all(updateProductsPromises);
  }
  res.status(200).json({
    status: "success",
    message: "Category deleted",
  });
});

exports.getCategory = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const category = await Category.findById(id);
  if (!category) {
    const err = new CustomError("There is no such category", 404);
    return next(err);
  }
  res.status(200).json({
    status: "success",
    category,
  });
});
