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
  promo: {
    type: Boolean,
  },
  promoPrice: {
    type: Number,
  },
  type: {
    type: String,
    required: true,
  },
  available: {
    type: Boolean,
    required: true,
  },
  brand: {
    type: String,
  },
  brandLogo: {
    type: String,
  },
  color: {
    type: String,
  },
  connectivity: {
    type: String,
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
