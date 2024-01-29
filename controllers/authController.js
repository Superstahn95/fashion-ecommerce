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
  console.log("we just hit the login controller");
  const { email, password } = req.body;
  if (!email || !password) {
    const err = new CustomError("Enter email and password", 400);
    return next(err);
  }

  const user = await User.findOne({ email });

  if (!user) {
    const err = new CustomError("Invalid credentials", 400);
    return next(err);
  }
  const isPasswordMatch = await user.compareDbPassword(password, user.password);
  console.log(isPasswordMatch);
  if (!isPasswordMatch) {
    const err = new CustomError("Invalid credentials", 400);
    return next(err);
  }
  console.log("generate tokens");
  const accessToken = generateJwtAccessToken(user._id).trim();
  const refreshToken = generateJwtRefreshToken(user._id);
  const expiredAt = new Date();
  console.log(accessToken, refreshToken, expiredAt);
  expiredAt.setDate(expiredAt.getDate() + 7); //token will expire 7 days later
  console.log(user._id);
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
});

//to be used when i come back to using cookies
exports.refresh = asyncErrorHandler(async (req, res, next) => {
  const refreshToken = req.cookies["refresh_token"];
  if (!refreshToken) {
    const err = new CustomError("Unauthenticated", 401);
    return next(err);
  }

  try {
    const decodedToken = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET
    );
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
  } catch (error) {
    const err = new CustomError("Unauthenticated", 401);
    return next(err);
  }

  // if (!decodedToken) {
  //   const err = new CustomError("Unauthenticated", 401);
  //   return next(err);
  // }
});
exports.protect = asyncErrorHandler(async (req, res, next) => {
  console.log("we just hit th protected middleware");
  const accessToken = req.headers.authorization.split(" ")[1] || "";
  if (!accessToken) {
    const err = new CustomError("Log in or sign up", 402);
    return next(err);
  }

  const decodedToken = jwt.verify(
    accessToken,
    process.env.JWT_ACCESS_TOKEN_SECRET
  );

  if (!decodedToken) {
    const err = new CustomError("Unauthenticated", 401);
    return next(err);
  }
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

//implement this on the frontend when choice of authentication is complete
exports.changeUserPassword = asyncErrorHandler(async (req, res, next) => {
  //get the user from req.user
  const user = await User.findById(req.user._id);
  //old password and new password should be part of the req.body
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const isPasswordMatch = await req.user.compareDbPassword(
    oldPassword,
    user.password
  );
  if (!isPasswordMatch) {
    const err = new CustomError("Incorrect password", 401);
    return next(err);
  }
  if (newPassword !== confirmPassword) {
    const err = new CustomError("Passwords do not match", 401);
    return next(err);
  }

  user.password = newPassword;
  user.confirmPassword = newPassword;

  await user.save();
  res.status(200).json({
    status: "sucess",
    message: "Password has been changed",
  });
});

// const generateJwtToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: "30d",
//   });
// };
const generateJwtAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_TOKEN_SECRET);
};

const generateJwtRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

exports.reAuthenticate = asyncErrorHandler(async (req, res, next) => {
  const { token } = req.body;
  if (!token) {
    const err = new CustomError("No token!! Not authenticated", 401);
    return next(err);
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        const err = new CustomError("Session expired", 401);
        return next(err);
      } else {
        const err = new CustomError("Token is invalid", 403);
        return next(err);
      }
    }
    const user = await User.findById(decoded.id);
    if (!user) {
      const err = new CustomError("User not found", 404);
      return next(err);
    }
    // const { password, ...userWithoutPassword } = user.toObject();
    // res.status(200).json({
    //   status: "success",
    //   user: userWithoutPassword,
    // });
    res.status(200).json({
      status: "success",
      user,
    });
  });
});
