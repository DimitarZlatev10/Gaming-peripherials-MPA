const Product = require("../models/Product");
const User = require("../models/User");

async function getAllProducts(type) {
  return Product.find({ type: type }).lean();
}

async function getFiveProducts() {
  return Product.find({}).limit(5).lean();
}

async function getFivePromoProducts() {
  return Product.find({ promo: true }).limit(5).lean();
}

async function getSimilarProducts(type, currentProductId, from, to) {
  return Product.find({
    _id: { $ne: currentProductId },
    type: type,
    price: { $gte: from, $lte: to },
  })
    .limit(6)
    .lean();
}

async function getMostFavoritedProducts() {
  return Product.find({})
    .sort({
      favourites: -1,
    })
    .limit(5)
    .lean();
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
          title: comment.title,
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

async function pagination(page, productsPerPage, type, sort) {
  if (sort) {
    if (sort == "price_lowest") {
      return Product.find({ type: type })
        .sort({ price: 1 })
        .skip(page * productsPerPage)
        .limit(productsPerPage)
        .lean();
    } else if (sort == "price_highest") {
      return Product.find({ type: type })
        .sort({ price: -1 })
        .skip(page * productsPerPage)
        .limit(productsPerPage)
        .lean();
    }
  }

  return Product.find({ type: type })
    .sort({ price: 1 })
    .skip(page * productsPerPage)
    .limit(productsPerPage)
    .lean();
}

async function paginateByPrice(page, productsPerPage, from, to, type, sort) {
  if (sort) {
    if (sort == "price_lowest") {
      return Product.find({
        price: { $gte: from, $lte: to },
        type: type,
      })
        .sort({ price: 1 })
        .skip(page * productsPerPage)
        .limit(productsPerPage)
        .lean();
    } else if (sort == "price_highest") {
      return Product.find({
        price: { $gte: from, $lte: to },
        type: type,
      })
        .sort({ price: -1 })
        .skip(page * productsPerPage)
        .limit(productsPerPage)
        .lean();
    }
  }

  return Product.find({
    price: { $gte: from, $lte: to },
    type: type,
  })
    .sort({ price: 1 })
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

async function paginateByBrand(page, productsPerPage, type, brand, sort) {
  if (sort) {
    if (sort == "price_lowest") {
      return Product.find({
        brand: brand,
        type: type,
      })
        .sort({ price: 1 })
        .skip(page * productsPerPage)
        .limit(productsPerPage)
        .lean();
    } else if (sort == "price_highest") {
      return Product.find({
        brand: brand,
        type: type,
      })
        .sort({ price: -1 })
        .skip(page * productsPerPage)
        .limit(productsPerPage)
        .lean();
    }
  }

  return Product.find({
    brand: brand,
    type: type,
  })
    .sort({ price: 1 })
    .skip(page * productsPerPage)
    .limit(productsPerPage)
    .lean();
}

async function getAllProductsByBrand(brand) {
  return Product.find({ brand: brand }).lean();
}

async function paginateByBrandAndPrice(
  page,
  productsPerPage,
  type,
  brand,
  from,
  to,
  sort
) {
  if (sort) {
    if (sort == "price_lowest") {
      return Product.find({
        type: type,
        brand: brand,
        price: { $gte: from, $lte: to },
      })
        .sort({ price: 1 })
        .skip(page * productsPerPage)
        .limit(productsPerPage)
        .lean();
    } else if (sort == "price_highest") {
      return Product.find({
        type: type,
        brand: brand,
        price: { $gte: from, $lte: to },
      })
        .sort({ price: -1 })
        .skip(page * productsPerPage)
        .limit(productsPerPage)
        .lean();
    }
  }

  return Product.find({
    type: type,
    brand: brand,
    price: { $gte: from, $lte: to },
  })
    .sort({ price: 1 })
    .skip(page * productsPerPage)
    .limit(productsPerPage)
    .lean();
}

async function getAllProductsByBrandAndPrice(type, brand, from, to) {
  return Product.find({
    type: type,
    brand: brand,
    price: { $gte: from, $lte: to },
  });
}

async function addToFavourites(userId, productId) {
  const user = await User.findById(userId);
  const product = await Product.findById(productId);

  if (!user) {
    throw new Error("User does not exist");
  } else if (!product) {
    throw new Error("Product does not exist");
  }

  if (user.favourites.includes(productId)) {
    throw new Error("This product is already added to your favourites");
  } else if (product.favourites.includes(userId)) {
    throw new Error("This product is already added to your favourites!");
  }

  user.favourites.push(productId);
  product.favourites.push(userId);

  await user.save();
  await product.save();

  return { message: "Sucessfully added to your favourites" };
}

async function removeFromFavourites(userId, productId) {
  const user = await User.findById(userId);
  const product = await Product.findById(productId);

  if (!user) {
    throw new Error("User does not exist");
  } else if (!product) {
    throw new Error("Product does not exist");
  }

  let userIndex = product.favourites.indexOf(userId);
  let productIndex = user.favourites.indexOf(productId);

  user.favourites.splice(productIndex, 1);
  product.favourites.splice(userIndex, 1);

  await user.save();
  await product.save();

  return { message: "Product sucessfully removed from your favourites" };
}

async function addToCart(userId, productId) {
  const user = await User.findById(userId);
  const product = await Product.findById(productId);

  if (!user) {
    throw new Error("User does not exist");
  } else if (!product) {
    throw new Error("Product does not exist");
  }

  if (user.cart.includes(productId)) {
    throw new Error("This product is already added to your cart");
  } else if (product.cart.includes(userId)) {
    throw new Error("This product is already added to your cart!");
  }

  user.cart.push(productId);
  product.cart.push(userId);

  await user.save();
  await product.save();

  return { message: "Sucessfully added to your cart" };
}

async function removeFromCart(userId, productId) {
  const user = await User.findById(userId);
  const product = await Product.findById(productId);

  if (!user) {
    throw new Error("User does not exist");
  } else if (!product) {
    throw new Error("Product does not exist");
  }

  const userIndex = product.cart.indexOf(userId);
  const productIndex = user.cart.indexOf(productId);

  user.cart.splice(productIndex, 1);
  product.cart.splice(userIndex, 1);

  await user.save();
  await product.save();

  return { message: "Product sucessfully removed from your favourites" };
}

module.exports = {
  getAllProducts,
  getProductById,
  addComment,
  deleteComment,
  pagination,
  getFiveProducts,
  paginateByPrice,
  getAllProductsByPrice,
  getAllProductsByType,
  paginateByBrand,
  getAllProductsByBrand,
  paginateByBrandAndPrice,
  getAllProductsByBrandAndPrice,
  getSimilarProducts,
  addToFavourites,
  removeFromFavourites,
  addToCart,
  removeFromCart,
  getMostFavoritedProducts,
  getFivePromoProducts,
};
