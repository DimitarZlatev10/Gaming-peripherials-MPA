const {
  getFiveProducts,
  getMostFavoritedProducts,
} = require("../services/product");

const router = require("express").Router();

router.get("/", async (req, res) => {
  const products = await getFiveProducts();
  const mostFavorited = await getMostFavoritedProducts();

  mostFavorited.forEach((f) => {
    if (f.favourites.length > 0) {
      f.isFavorited = true;
    }
  });

  res.render("home", { title: "Home Page", products, mostFavorited });
});

module.exports = router;
