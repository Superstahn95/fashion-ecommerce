const express = require("express");
const {
  createOrder,
  getOrder,
  getOrders,
  updateOrderStatus,
  getUserOrder,
} = require("../controllers/orderController");
const { protect } = require("../controllers/authController");

const router = express.Router();

//fix middleware
router.get("/", protect, getOrders);
router.get("/:id", protect, getOrder);
router.get("/user/:id", protect, getUserOrder);

router.post("/", createOrder);
router.patch("/:id", protect, updateOrderStatus);
//get a particular client order

module.exports = router;
