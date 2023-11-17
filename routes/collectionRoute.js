const express = require("express");
const multer = require("../middlewares/multer");
const {
  getCollection,
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
} = require("../controllers/collectionController");
const { protect } = require("../controllers/authController");

const router = express.Router();

router.get("/", protect, getCollections);
router.post("/", multer.single("image"), createCollection);

module.exports = router;
