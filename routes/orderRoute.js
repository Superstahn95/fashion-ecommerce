const express = require("express");
const {
  createOrder,
  getOrder,
  getOrders,
} = require("../controllers/orderController");
const { protect } = require("../controllers/authController");

const router = express.Router();

router.get("/", getOrders);
router.get("/:id", getOrder);
router.post("/", createOrder);

module.exports = router;
