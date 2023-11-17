const paystack = require("paystack")(process.env.PAYSTACK_SECRET_KEY);
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const axios = require("axios");
const Order = require("../models/orderModel");
const CustomError = require("../utils/customError");

//this is going to be a protected route
//the function returns the authorization url which we need to figure out a way to handle in our frontend
exports.verifyPayment = asyncErrorHandler(async (req, res, next) => {
  const { amount, reference, email } = req.body;
  const order = await Order.find({ paymentReference: reference });
  if (!order) {
    const err = new CustomError("Order cannot be found", 404);
    return next(err);
  }

  const response = await axios.get(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: process.env.PAYSTACK_SECRET_KEY,
      },
    }
  );
  const { data } = response.data;
  if (
    data.status === true &&
    data.amount === amount &&
    data.customer.email === email
  ) {
    //if we get here, data is valid and we can run the order logic here
    //find order by reference
    // await Order.findByIdAndUpdate(orderId, { status: 'Paid' });
    order.status = "processsing";
    await order.save();
    res.status(200).json({
      status: "success",
      message: "Payment has been verfied",
    });
  } else {
    // Payment verification failed
    res
      .status(400)
      .json({ status: "error", message: "Payment verification failed" });
  }
});

//a user gathers cart items
//a user tries to check out which should direct to the payment gateway
//for authenticated users, check out should go the payment gateway
//for guest users, check out should first pop out a form to fill in details
//after payment has succeeded, order can now be sent to my backend
