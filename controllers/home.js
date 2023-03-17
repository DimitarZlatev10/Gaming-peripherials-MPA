const { getFiveProducts } = require("../services/product");

const router = require("express").Router();

router.get("/", async (req, res) => {
  const products = await getFiveProducts();

  res.render("home", { title: "Home Page", products });
});

module.exports = router;
