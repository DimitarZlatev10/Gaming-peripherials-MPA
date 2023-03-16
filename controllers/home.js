const { getAllPosts } = require("../services/product");

const router = require("express").Router();

router.get("/", async (req, res) => {
  const products = await getAllPosts();

  const userInfo = req.session.user;
  console.log(userInfo);
  res.render("home", { title: "Home Page", products, userInfo });
});

module.exports = router;
