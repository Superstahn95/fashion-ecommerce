const express = require("express");
const multer = require("../middlewares/multer");
const {
  getProducts,
  createProduct,
  getProduct,
  deleteProduct,
  updateProduct,
} = require("../controllers/productController");

const router = express.Router();

//public route
router.get("/", getProducts);
router.get("/:id", getProduct);

//private route for admin only
router.post("/", multer.single("image"), createProduct);
router.delete("/:id", deleteProduct);
router.patch("/:id", multer.single("image"), updateProduct);

module.exports = router;
