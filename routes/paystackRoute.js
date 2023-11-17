const express = require("express");
const { protect } = require("../controllers/authController");
const { verifyPayment } = require("../controllers/paystackController");
const router = express.Router();

router.post("/", protect, verifyPayment);
module.exports = router;
