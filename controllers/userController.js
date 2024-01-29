const User = require("../models/userModel");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const cloudinary = require("../utils/cloudinary");
const CustomError = require("../utils/customError");

exports.getUsers = asyncErrorHandler(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    users,
  });
});

exports.updateUser = asyncErrorHandler(async (req, res, next) => {
  //   console.log("we just hit the update user controller");
  //user id should be present in the req.user

  // const user = await User.findById(req.user._id);
  //   const user = await User.findById(req.body.id); //temporal means
  const { file } = req;
  console.log(req.file);
  //   if (!user) {
  //     const err = new CustomError("No user found", 404);
  //     return next(err);
  //   }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: req.body },
    { new: true }
  );

  if (file) {
    if (req.user.profilePicture) {
      console.log("we have a file here");
      const { public_id: imageId } = req.user.profilePicture;
      await cloudinary.uploader.destroy(imageId);
    }
    const { secure_url: url, public_id } = await cloudinary.uploader.upload(
      file.path
    );

    updatedUser.profilePicture = { url, public_id };
  }
  await updatedUser.save();
  res.status(200).json({
    status: "success",
    user: updatedUser,
    message: "Details updated",
  });
});
