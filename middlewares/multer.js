const multer = require("multer");

const storage = multer.diskStorage({});
const fileFilter = (req, file, cb, next) => {
  if (!file.mimetype.includes("image")) {
    console.log("The file is not an image type");
    return cb("Invalid image format", false);
    // i tried returning an error message here with our customError class but i didn't have access to the next method
  }
  cb(null, true);
};

module.exports = multer({ storage, fileFilter });
