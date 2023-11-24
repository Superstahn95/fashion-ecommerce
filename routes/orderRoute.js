const express = require("express");
const {
  createOrder,
  getOrder,
  getOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect } = require("../controllers/authController");

const router = express.Router();

router.get("/", getOrders);
router.get("/:id", getOrder);
router.post("/", createOrder);
router.patch("/:id", updateOrderStatus);

module.exports = router;
