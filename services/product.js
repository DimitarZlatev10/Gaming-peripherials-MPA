const Product = require("../models/Product");

async function getAllPosts() {
  return Product.find({}).lean();
}

async function getFiveProducts() {
  return Product.find({}).limit(5).lean();
}

async function getProductById(productId) {
  return Product.findById(productId).lean();
}

async function addComment(productId, comment) {
  await Product.updateOne(
    { _id: productId },
    {
      $push: {
        comments: {
          _id: comment._id,
          username: comment.username,
          rating: comment.rating,
          comment: comment.comment,
          owner: comment.owner,
          productId: productId,
          userImage: comment.userImage,
        },
      },
    }
  );
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

async function pagination(page, productsPerPage, type) {
  return Product.find({ type: type })
    .skip(page * productsPerPage)
    .limit(productsPerPage)
    .lean();
}

async function paginateByPrice(page, productsPerPage, from, to, type) {
  return Product.find({
    price: { $gte: from, $lte: to },
    type: type,
  })
    .skip(page * productsPerPage)
    .limit(productsPerPage)
    .lean();
}

async function getAllProductsByPrice(from, to, type) {
  return Product.find({
    price: { $gte: from, $lte: to },
    type: type,
  }).lean();
}

async function getAllProductsByType(type) {
  return Product.find({ type: type }).lean();
}

module.exports = {
  getAllPosts,
  getProductById,
  addComment,
  deleteComment,
  pagination,
  getFiveProducts,
  paginateByPrice,
  getAllProductsByPrice,
  getAllProductsByType,
};
