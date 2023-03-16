const Product = require("../models/Product");

async function getAllPosts() {
  return Product.find({}).lean();
}

async function getProductById(productId) {
  return Product.findById(productId).lean();
}

async function addComment(productId, comment) {
  const existingProduct = await Product.findById(productId);

  existingProduct.comments.push(comment);
  await existingProduct.save();
}

async function deleteComment(productId, commentId) {
  let product = await Product.findById(productId);

  product.comments.forEach((p, i) => {
    if (p._id == commentId) {
      product.comments.splice(i, 1);
    }
  });

  await product.save();
}

module.exports = {
  getAllPosts,
  getProductById,
  addComment,
  deleteComment,
};
