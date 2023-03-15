const { getAllPosts } = require("../services/product");

const router = require("express").Router();

router.get("/", async (req, res) => {
  const products = await getAllPosts();

  res.render("home", { title: "Home Page", products });
});

module.exports = router;
