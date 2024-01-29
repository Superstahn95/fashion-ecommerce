const express = require("express");
const multer = require("../middlewares/multer");
const {
  registerUser,
  logInUser,
  refresh,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", multer.single("profilePicture"), registerUser);
router.post("/login", logInUser);
router.post("/refresh", refresh);

module.exports = router;
