const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const cloudinary = require("../utils/cloudinary");
const CustomError = require("../utils/customError");

exports.registerUser = asyncErrorHandler(async (req, res, next) => {
  const { file } = req;
  //   if (req.body.password !== req.body.confirmPassword) {
  //     const err = new CustomError("Passwords do not match", 400);
  //     return next(err);
  //   }
  const user = new User(req.body);
  if (file) {
    //upload to cloudinary if there is a file present in our request
    const { secure_url: url, public_id } = await cloudinary.uploader.upload(
      file.path
    );
    user.profilePicture = { url, public_id };
  }
  //   await user.hashPassword();
  const savedUser = await user.save();
  const token = generateJwtToken(savedUser._id);
  //sending the token as part of my response because i want to log in the user after an account has been created
  res.cookie("access_token", token, { httpOnly: true }).status(200).json({
    status: "success",
    user,
  });
});
exports.logInUser = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const err = new CustomError("Enter email and password", 400);
    return next(err);
  }

  const user = await User.findOne({ email });

  if (!user) {
    const err = new CustomError("Invalid credentials", 404);
    return next(err);
  }
  const isPasswordMatch = await user.compareDbPassword(password, user.password);

  if (!isPasswordMatch) {
    const err = new CustomError("Invalid credentials", 404);
    return next(err);
  }
  const token = generateJwtToken(user._id);
  //set cookies
  res.cookie("access_token", token, { httpOnly: true }).status(200).json({
    status: "success",
    user,
  });
  // res.status(200).json({
  //   status: "success",
  //   data: user,
  //   token,
  // });
});

exports.protect = asyncErrorHandler(async (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    // check this error code
    const err = new CustomError("Log in or Sign up", 401);
    return next(err);
  }
  //   what will our error message look like when the token is an invalid signature
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decodedToken.id);
  if (!user) {
    const err = new CustomError("No user found", 404);
    return next(err);
  }
  req.user = user;
  next();
});

exports.signOut = asyncErrorHandler(async (req, res, next) => {
  res.clearCookie("access_token");
  res.status(200).json({
    status: "success",
    message: "User has been logged out",
  });
});

const generateJwtToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};
