const Product = require("../models/Product");

async function getAllPosts() {
  return Product.find({}).lean();
}

module.exports = {
  getAllPosts,
};
