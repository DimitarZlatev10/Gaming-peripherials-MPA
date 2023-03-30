const { isGuest, isUser } = require("../middlewares/guards");
const { getProductById } = require("../services/product");
const { register, login, getUser } = require("../services/user");
const { mapErrors } = require("../utils/errorDisplayer");

const router = require("express").Router();

router.get("/register", isGuest(), (req, res) => {
  res.render("register", { title: "Register Page" });
});

router.post("/register", isGuest(), async (req, res) => {
  try {
    if (req.body.password.trim() < 4) {
      throw new Error("Password must be at least 4 characters long!");
    } else if (req.body.password != req.body.repass) {
      throw new Error("Passwords dont match");
    }

    const user = await register(
      req.body.firstName,
      req.body.lastName,
      req.body.image,
      req.body.email,
      req.body.password
    );

    req.session.user = user;

    if (req.session.redirectUrl) {
      res.redirect(req.session.redirectUrl);
      delete req.session.redirectUrl;
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.error(err);
    const errors = mapErrors(err);
    const data = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      image: req.body.image,
      email: req.body.email,
    };
    res.render("register", { title: "Register Page", data, errors });
  }
});

router.get("/login", isGuest(), (req, res) => {
  res.render("login", { title: "Login Page" });
});

router.post("/login", isGuest(), async (req, res) => {
  try {
    const user = await login(req.body.email, req.body.password);
    req.session.user = user;

    if (req.session.redirectUrl) {
      res.redirect(req.session.redirectUrl);
      delete req.session.redirectUrl;
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.error(err);
    const errors = mapErrors(err);
    res.render("login", { title: "Login Page", email: req.body.email, errors });
  }
});

router.get("/logout", isUser(), (req, res) => {
  delete req.session.user;
  res.redirect("/");
});

router.get("/favourites", isUser(), async (req, res) => {
  const user = await getUser(req.session.user._id);

  let favoredItems = [];
  if (user.favourites.length > 0) {
    user.favourites.forEach(async (f) => {
      let favored = await getProductById(f);
      favoredItems.push(favored);
    });
  }

  req.session.redirectUrl = req.url;

  res.render("favourites", {
    title: "Favourites",
    favoredItems,
    totalFavorites: user.favourites.length > 0 ? user.favourites.length : null,
    totalCarted: user.cart.length > 0 ? user.cart.length : null,
    user,
  });
});

router.get("/cart", isUser(), async (req, res) => {
  const user = await getUser(req.session.user._id);
  let cartItems = [];

  if (user.cart.length > 0) {
    user.cart.forEach(async (c) => {
      let carted = await getProductById(c);
      cartItems.push(carted);
    });
  }

  req.session.redirectUrl = req.url;

  res.render("cart", {
    title: "cart",
    cartItems,
    totalCarted: user.cart.length > 0 ? user.cart.length : null,
    totalFavourites: user.favourites.length > 0 ? user.favourites.length : null,
    user,
  });
});

module.exports = router;
