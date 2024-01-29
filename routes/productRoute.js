const express = require("express");
const multer = require("../middlewares/multer");
const {
  getProducts,
  createProduct,
  getProduct,
  deleteProduct,
  updateProduct,
} = require("../controllers/productController");
const { protect } = require("../controllers/authController");

const router = express.Router();

//public route
router.get("/", getProducts);
//below route to be implemented later
router.get(
  "/test-cookie-products",
  (req, res, next) => {
    console.log("we just hit the products middleware");
    next();
  },
  protect,
  getProducts
);
router.get("/test-second-cookie-products", protect, getProducts);
router.get("/:id", getProduct);

//private route for admin only
//add role checker middleware
router.post("/", multer.single("image"), protect, createProduct);
router.delete("/:id", deleteProduct);
router.patch("/:id", multer.single("image"), protect, updateProduct);

module.exports = router;
