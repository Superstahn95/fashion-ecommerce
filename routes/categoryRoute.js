const express = require("express");
const {
  createCategory,
  getCategories,
  getCategory,
  deleteCategory,
  updateCategory,
} = require("../controllers/categoryController");

const multer = require("../middlewares/multer");

const router = express.Router();
router.post("/", multer.single("image"), createCategory);
router.patch("/:id", multer.single("image"), updateCategory);
router.get("/", getCategories);
router.get("/:id", getCategory);
router.delete("/:id", deleteCategory);

// router.deleteCategory("/:id", deleteCategory);

//update category and delete category

module.exports = router;
