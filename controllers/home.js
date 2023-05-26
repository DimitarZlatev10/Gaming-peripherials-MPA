const {
  getMostFavoritedProducts,
  getFivePromoProducts,
} = require("../services/product");

const router = require("express").Router();

router.get("/", async (req, res) => {
  const products = await getFivePromoProducts();
  const mostFavorited = await getMostFavoritedProducts();

  delete req.session.redirectUrl;

  let results = false;
  mostFavorited.forEach((f) => {
    if (f.favourites.length > 0) {
      f.isFavorited = true;
      results = true;
    }
  });

  res.render("home", {
    title: "Home Page",
    products,
    mostFavorited,
    results,
  });
});

module.exports = router;
