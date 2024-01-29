const Order = require("../models/orderModel");
const User = require("../models/userModel");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const CustomError = require("../utils/customError");
//user, email, items(product, quantity, price), totalAmount, shippingAddress, phoneNumber,

exports.createOrder = asyncErrorHandler(async (req, res, next) => {
  console.log("we are about creating an order");
  console.log(req.body);
  const { items } = req.body;
  const { paymentReference } = req.body;

  if (!paymentReference) {
    const err = new CustomError("No payment reference found", 400);
    return next(err);
  }
  if (!items) {
    const err = new CustomError("You cannot place an empty order", 400);
    return next(err);
  }
  const totalAmount = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  let userData;
  if (req.body.user) {
    const user = await User.findById(req.body.user);
    if (!user) {
      const err = new CustomError("User not found", 404);
      return next(err);
    }
    console.log("This is the id of the user with this order");
    console.log(user._id);
    userData = {
      user: user._id,
      email: user.email,
      items: items,
      totalAmount,
      shippingAddress: user.shippingAddress,
      phoneNumber: user.phoneNumber,
      paymentReference,
    };
  } else {
    const { email, shippingAddress, phoneNumber } = req.body;
    userData = {
      email,
      shippingAddress,
      phoneNumber,
      totalAmount,
      items: items,
      paymentReference,
    };
  }
  // const user = req.user.id;
  // const {  totalAmount, shippingAddress, paymentMethod } = req.body;
  const order = new Order(userData);
  await order.save();
  console.log(order);
  res.status(200).json({
    status: "success",
    message: "order placed successfully",
    order,
  });
});

//protected route for admin at least for now
exports.getOrders = asyncErrorHandler(async (req, res, next) => {
  const orders = await Order.find().populate("user").populate("items.product");
  res.status(200).json({
    status: "success",
    orders,
  });
});

//protected route for admin at least for now
exports.getOrder = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const order = await Order.findById(id);
  res.status(200).json({
    status: "success",
    order,
  });
});

exports.updateOrderStatus = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const order = await Order.findById(id);
  if (!order) {
    const err = new CustomError("Order not found", 404);
    return next(err);
  }
  const { status } = req.body;
  //action will be a string
  const updatedOrder = await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
  res.status(200).json({
    status: "success",
    order: updatedOrder,
  });
});

//protected route
exports.getUserOrder = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;

  const orders = await Order.find({ user: id });
  res.status(200).json({
    status: "success",
    orders,
  });
});
