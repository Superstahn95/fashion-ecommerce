const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Enter your name"],
  },
  email: {
    type: String,
    required: [true, "Enter your email"],
    unique: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  phoneNumber: {
    type: String,
  },
  profilePicture: {
    type: Object,
    url: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
  },
  shippingAddress: {
    type: String,
  },
  password: {
    type: String,
    required: [true, "Enter your password"],
  },
  confirmPassword: {
    type: String,
    required: [true, "Please confirm password"],
    validate: {
      validator: function (val) {
        return (this.password = val);
      },
      message: "Password and confirm password do not match",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpire: Date,
});

//this method of encryption is not automated as it needs to be called whenever we wish to hash the password
userSchema.methods.hashPassword = async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.confirmPassword = undefined;
};

//this method is more automated and we can use any based on our preferences
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10); // i still need to know why i am using 10 here
  this.password = await bcrypt.hash(this.password, salt);
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.compareDbPassword = async (sentPassword, actualPassword) => {
  return await bcrypt.compare(sentPassword, actualPassword);
};

userSchema.methods.consoleUser = function () {
  console.log(this.name, this.email);
};

module.exports = mongoose.model("User", userSchema);
