const authController = require("../controllers/auth");
const homeController = require("../controllers/home");
const productController = require("../controllers/product");

module.exports = (app) => {
  app.use(authController);
  app.use(homeController);
  app.use(productController);

  //   app.get("*", (req, res) => {
  //     res.render("404", { title: "404 Page" });
  //   });
};
