const {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  inStock: {
    type: Number,
    required: true,
  },
  available: {
    type: Boolean,
    required: true,
  },
  favourites: {
    type: [ObjectId],
    ref: "User",
    default: [],
  },
  cart: {
    type: [ObjectId],
    ref: "User",
    default: [],
  },
  comments: {
    type: [],
    ref: "User",
    default: [],
  },
});

const Product = model("Product", productSchema);

module.exports = Product;
