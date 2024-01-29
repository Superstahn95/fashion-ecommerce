const express = require("express");
const { getUsers, updateUser } = require("../controllers/userController");
const { protect } = require("../controllers/authController");
const multer = require("../middlewares/multer");

const router = express.Router();

//protect these routes
router.get("/", protect, getUsers);
router.patch("/update", multer.single("profilePicture"), protect, updateUser);

module.exports = router;
