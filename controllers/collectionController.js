const Collection = require("../models/collectionModel");
const cloudinary = require("../utils/cloudinary");
const asyncErrorHandler = require("../utils/asyncErrorHandler");

exports.createCollection = asyncErrorHandler(async (req, res, next) => {
  const { file } = req;
  const collection = new Collection(req.body);
  if (file) {
    console.log("there is a file here");
    const { secure_url: url, public_id } = await cloudinary.uploader.upload(
      file.path
    );
    collection.image = { url, public_id };
    console.log(collection);
  }
  const newCollection = await collection.save();
  res.status(200).json({
    status: "success",
    data: newCollection,
  });
});
exports.getCollections = asyncErrorHandler(async (req, res, next) => {
  const collections = await Collection.find().populate("products");
  res.status(200).json({
    status: "success",
    data: collections,
  });
});

exports.getCollection = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const collection = await Collection.findById(id);
  if (!collection) {
    const err = new CustomError("Collection not found", 404);
    return next(err);
  }
  res.status(200).json({
    status: "success",
    data: collection,
  });
});

exports.deleteCollection = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const collection = await Collection.findById(id);
  const { public_id } = collection.image;
  if (!collection) {
    const err = new CustomError("Collection not found", 404);
    return next(err);
  }
  if (public_id) await cloudinary.uploader.destroy(public_id);
  await Collection.findByIdAndDelete(id);
  // ???? after deleting a collection, do we also delete the products under that collection
  res.status(200).json({
    status: "success",
    message: "Collection deleted successfully",
  });
});

exports.updateCollection = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const { file } = req;
  const collection = await Collection.findById(id);
  if (!collection) {
    const err = new CustomError("Collection not found", 404);
    return next(err);
  }
  let updatedCollection = await Collection.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true }
  );
  //is there a more suitable way to get this done? that doesn't require us making alterations twice?
  if (file) {
    if (collection.image) {
      const { public_id: imageId } = collection.image;
      await cloudinary.uploader.destroy(imageId);
    }
    const { secure_url: url, public_id } = await cloudinary.uploader.upload(
      file.path
    );
    updatedCollection = await Collection.findByIdAndUpdate(
      id,
      { image: { url, public_id } },
      { new: true }
    );
  }

  res.status(200).json({
    status: "success",
    data: updatedCollection,
  });
});
