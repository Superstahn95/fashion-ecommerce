const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Token = require("../models/TokenModel");
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
  const accessToken = generateJwtAccessToken(savedUser._id);
  const refreshToken = generateJwtRefreshToken(savedUser._id);
  const expiredAt = new Date();
  expiredAt.setDate(expiredAt.getDate() + 7); //token will expire 7 days later
  //save token to token model
  const newToken = new Token({
    user: savedUser._id,
    refreshToken,
    expiredAt,
  });
  await newToken.save();
  //sending the token as part of my response because i want to log in the user after an account has been created
  res
    .cookie("refresh_token", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({
      status: "success",
      savedUser,
      token: accessToken,
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
  const accessToken = generateJwtAccessToken(savedUser._id);
  const refreshToken = generateJwtRefreshToken(savedUser._id);
  const expiredAt = new Date();
  expiredAt.setDate(expiredAt.getDate() + 7); //token will expire 7 days later
  //save token to token model
  const newToken = new Token({
    user: user._id,
    refreshToken,
    expiredAt,
  });

  await newToken.save();
  //sending the token as part of my response because i want to log in the user after an account has been created
  res
    .cookie("refresh_token", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({
      status: "success",
      user,
      token: accessToken,
    });
  // const token = generateJwtToken(user._id);
  //set cookies
  // res.cookie("access_token", token, { httpOnly: true }).status(200).json({
  //   status: "success",
  //   user,
  // });
  // res.status(200).json({
  //   status: "success",
  //   data: user,
  //   token,
  // });
});
exports.refresh = asyncErrorHandler(async (req, res, next) => {
  const refreshToken = req.cookies["refresh_token"];
  const decodedToken = jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_TOKEN_SECRET
  );
  if (!decodedToken) {
    const err = new CustomError("Unauthenticated", 401);
    return next(err);
  }
  const currentDate = new Date();
  const token = await Token.findOne({
    user: decodedToken.id,
    expiredAt: { $gte: currentDate },
  });
  if (!token) {
    const err = new CustomError("Unauthenticated", 401);
    return next(err);
  }
  const accessToken = generateJwtAccessToken(decodedToken.id);
  res.status(200).json({ token: accessToken });
});
exports.protect = asyncErrorHandler(async (req, res, next) => {
  //change to using bearer token
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

// const generateJwtToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: "30d",
//   });
// };
const generateJwtAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: "30s",
  });
};

const generateJwtRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_TOKEN_SECRET, {
    expiresIn: "1d",
  });
};
