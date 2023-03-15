const {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

const userSchema = new Schema({
  firstName: {
    type: String,
    minlength: [2, "First Name must be at least 2 characters long"],
    required: [true, "First Name is required"],
  },
  lastName: {
    type: String,
    minlength: [2, "Last Name must be at least 2 characters long"],
    required: [true, "Last Name is required"],
  },
  image: {
    type: String,
    minlength: [10, "Image must be at least 10 characters long"],
    required: [true, "Email is required"],
  },
  email: {
    type: String,
    minlength: [10, "Email must be at least 10 characters long"],
    required: [true, "Email is required"],
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  favourites: {
    type: [ObjectId],
    ref: "Products",
    default: [],
  },
  cart: {
    type: [ObjectId],
    ref: "Products",
    default: [],
  },
});

userSchema.index(
  { email: 1 },
  {
    unique: true,
    collation: {
      locale: "en",
      strength: 2,
    },
  }
);

const User = model("User", userSchema);

module.exports = User;
