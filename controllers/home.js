const {
  getFiveProducts,
  getMostFavoritedProducts,
} = require("../services/product");

const router = require("express").Router();

router.get("/", async (req, res) => {
  const products = await getFiveProducts();
  const mostFavorited = await getMostFavoritedProducts();

  res.render("home", { title: "Home Page", products, mostFavorited });
});

module.exports = router;
