const CustomError = require("../utils/customError");
const devErrors = (err, res) => {
  res.status(err.statusCode).json({
    message: err.message,
    status: err.status,
    stackTrace: err.stack,
    error: err,
  });
};
const prodErrors = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  res.status(500).json({
    status: "error",
    message: "something went wrong",
  });
};

const validationErrorHandler = (err) => {
  const error = Object.values(err.errors).map((val) => val.message);
  const errorMessages = error.join(". ");
  const message = `Invalid input data: ${errorMessages}`;
  return new CustomError(message, 400);
};
const duplicateKeyErrorHandler = (err) => {
  const message = `The ${Object.keys(err.keyValue).join(
    ""
  )} has already been taken`;
  return new CustomError(message, 400);
};

const tokenExpiredError = (err) => {
  const message = "access token expired";
  return new CustomError(message, 401);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENVIRONMENT === "development") {
    devErrors(err, res);
  } else if (process.env.NODE_ENVIRONMENT === "production") {
    if (err.name === "ValidationError") err = validationErrorHandler(err);
    if (err.code === 11000) err = duplicateKeyErrorHandler(err);
    if (err.name === "TokenExpiredError") err = tokenExpiredError(err);
    // if(err.name)
    prodErrors(err, res);
  }
};
