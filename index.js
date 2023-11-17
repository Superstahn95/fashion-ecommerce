const express = require("express");
const dotenv = require("dotenv");
const connectDb = require("./config/db");
const globalErrorHandler = require("./controllers/errorController");
const axios = require("axios");

const app = express();
dotenv.config();
const PORT = process.env.PORT || 5500;

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // what does this really do?? => urlencoded data parser middleware

//routing middleware
app.use("/api/v1/product", require("./routes/productRoute"));
app.use("/api/v1/category", require("./routes/categoryRoute"));
app.use("/api/v1/auth", require("./routes/authRoute"));
app.use("/api/v1/collection", require("./routes/collectionRoute"));
app.use("/api/v1/order", require("./routes/orderRoute"));
app.use("/api/v1/paystack", require("./routes/paystackRoute"));
app.use("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: "Route not found",
  });
});

//global error handler
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDb();
});

//to fix this
//i need a way to restart my server whenever my app crashes
//handling exception errors and stuff like that
