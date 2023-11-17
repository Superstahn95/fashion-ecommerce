const mongoose = require("mongoose");

const connectDb = async () => {
  // console.log(process.env.CONNECTION_STRING);
  try {
    const conn = await mongoose.connect(process.env.CONNECTION_STRING);
    console.log(`Mongo db connected : ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDb;
