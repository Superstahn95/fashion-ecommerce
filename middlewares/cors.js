const cors = require("cors");
const CustomError = require("../utils/customError");
const allowedOrigins = require("../config/allowedOrigins");

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      const err = new CustomError("Not allowed by cors");
      callback(err);
    }
  },
  optionsSuccessStatus: 200,
};
module.exports = cors(corsOptions);
