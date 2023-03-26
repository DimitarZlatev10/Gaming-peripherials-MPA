const {
  getProductById,
  addComment,
  deleteComment,
  pagination,
  paginateByPrice,
  getAllProductsByPrice,
  getAllProductsByType,
  paginateByBrand,
  getAllProductsByBrand,
  getAllProductsByBrandAndPrice,
  paginateByBrandAndPrice,
  getAllProducts,
} = require("../services/product");
const { mapErrors } = require("../utils/errorDisplayer");
const {
  Types: { ObjectId },
} = require("mongoose");
const { isUser } = require("../middlewares/guards");

const router = require("express").Router();

router.get("/details/:id", async (req, res) => {
  const product = await getProductById(req.params.id);

  if (product.comments.length > 0) {
    if (req.session.user) {
      product.comments.forEach((c) => {
        if (c.owner == req.session.user._id) {
          c.isOwner = true;
        }
      });
    }

    const productId = product._id;
    let totalRating = 0;
    let totalReviews = product.comments.length;
    product.comments.forEach((r) => {
      totalRating += Number(r.rating);
    });

    product.comments.forEach((r) => {
      if (Number(r.rating) >= 1 && Number(r.rating) < 2) {
        r.oneStar = true;
      } else if (Number(r.rating) >= 2 && Number(r.rating) < 3) {
        r.twoStar = true;
      } else if (Number(r.rating) >= 3 && Number(r.rating) < 4) {
        r.threeStar = true;
      } else if (Number(r.rating) >= 4 && Number(r.rating) < 5) {
        r.fourStar = true;
      } else if (Number(r.rating) >= 5) {
        r.fiveStar = true;
      }
    });

    let finalRating = (totalRating / totalReviews).toFixed(1);

    let stars = {
      oneStar: finalRating >= 1 && finalRating < 2,
      twoStar: finalRating >= 2 && finalRating < 3,
      threeStar: finalRating >= 3 && finalRating < 4,
      fourStar: finalRating >= 4 && finalRating < 5,
      fiveStar: finalRating >= 5,
    };

    res.render("details", {
      title: `${product.title}`,
      product,
      finalRating,
      totalReviews,
      productId,
      stars,
    });
  } else {
    res.render("details", { title: `${product.title}`, product });
  }
});

router.post("/addComment/:id", isUser(), async (req, res) => {
  try {
    if ((req.body.rating > 5 && req.body.rating < 1) || req.body.rating == "") {
      throw new Error("Rating is required and must be between 1 and 5");
    }

    if (req.body.title == "") {
      throw new Error("Title is required");
    }

    const commentInfo = {
      _id: new ObjectId(),
      username: `${req.session.user.firstName} ${req.session.user.lastName}`,
      rating: req.body.rating,
      title: req.body.title,
      comment: req.body.comment,
      owner: req.session.user._id,
      productId: req.params.id,
      userImage: req.session.user.image,
    };

    await addComment(req.params.id, commentInfo);
    res.redirect(`/details/${req.params.id}#comments`);
  } catch (err) {
    console.error(err.message);
    const errors = mapErrors(err);
    const product = await getProductById(req.params.id);
    res.render("details", {
      title: `${product.title}`,
      errors,
      product,
      rating: req.body.rating,
      commentTitle: req.body.title,
      comment: req.body.comment,
    });
  }
});

router.get(
  "/deleteComment/:productId/:commentId",
  isUser(),
  async (req, res) => {
    try {
      await deleteComment(req.params.productId, req.params.commentId);
      res.redirect(`/details/${req.params.productId}#comments`);
    } catch (err) {
      console.error(err);
    }
  }
);

router.get("/products/:type", async (req, res) => {
  let type = req.params.type;
  let page = req.query.page || 1;
  let productsPerPage = Number(req.query.productsPerPage) || 5;
  let priceRange = req.query.priceRange;
  let brand = req.query.brand;
  let sort = req.query.sort;

  if (type != "mouse" && type != "keyboard" && type != "headphones") {
    res.redirect("/products");
  }

  let selectedBrandFilter;

  if (brand) {
    if (
      brand != "asus" &&
      brand != "razor" &&
      brand != "bloody" &&
      brand != "logitec"
    ) {
      res.redirect("/products/" + type);
    }

    selectedBrandFilter = {
      asus: brand == "asus",
      razor: brand == "razor",
      bloody: brand == "bloody",
      logitec: brand == "logitec",
    };
  }

  let selectedPriceFilter;

  if (priceRange) {
    if (
      priceRange != "10/40" &&
      priceRange != "40/80" &&
      priceRange != "80/140" &&
      priceRange != "140/200" &&
      priceRange != "200/400"
    ) {
      priceRange = "10/40";
    }

    selectedPriceFilter = {
      priceFilterOne: priceRange == "10/40",
      priceFilterTwo: priceRange == "40/80",
      priceFilterThree: priceRange == "80/140",
      priceFilterFour: priceRange == "140/200",
      priceFilterFive: priceRange == "200/400",
    };
  }

  let selectedSortFilter;

  if (sort) {
    if (sort != "price_lowest" && sort != "price_highest") {
      sort = "price_lowest";
    }

    selectedSortFilter = {
      sortLowestPrice: sort == "price_lowest",
      sortHighestPrice: sort == "price_highest",
    };
  }

  if (page < 1) {
    page = 1;
  }

  if (productsPerPage < 5) {
    productsPerPage = 5;
  } else if (
    (productsPerPage > 5 && productsPerPage < 10) ||
    (productsPerPage > 10 && productsPerPage < 15)
  ) {
    productsPerPage = 10;
  } else if (productsPerPage > 15) {
    productsPerPage = 15;
  }

  let selectedProductsPerPage = {
    selectedFive: productsPerPage == 5,
    selectedTen: productsPerPage == 10,
    selectedFifteen: productsPerPage == 15,
  };

  let products;
  let totalProducts;

  if (brand && priceRange) {
    let from = Number(priceRange.split("/")[0]);
    let to = Number(priceRange.split("/")[1]);

    products = await paginateByBrandAndPrice(
      page - 1,
      productsPerPage,
      type,
      brand,
      from,
      to,
      sort
    );
    totalProducts = (await getAllProductsByBrandAndPrice(type, brand, from, to))
      .length;
  } else if (brand) {
    products = await paginateByBrand(
      page - 1,
      productsPerPage,
      type,
      brand,
      sort
    );
    totalProducts = (await getAllProductsByBrand(brand)).length;
  } else if (priceRange) {
    let from = Number(priceRange.split("/")[0]);
    let to = Number(priceRange.split("/")[1]);

    products = await paginateByPrice(
      page - 1,
      productsPerPage,
      from,
      to,
      type,
      sort
    );
    totalProducts = (await getAllProductsByPrice(from, to, type)).length;
  } else {
    products = await pagination(page - 1, productsPerPage, type, sort);
    totalProducts = (await getAllProductsByType(type)).length;
  }

  let totalPages = Math.ceil(totalProducts / productsPerPage);

  let pageIndex = [];

  for (let i = 1; i <= totalPages; i++) {
    if (page == i) {
      pageIndex.push({
        page: i,
        productsPerPage: productsPerPage,
        currentPage: true,
        priceRange: priceRange ? priceRange : false,
        type: type,
        brand: brand ? brand : false,
        sort: sort,
      });
    } else {
      pageIndex.push({
        page: i,
        productsPerPage: productsPerPage,
        currentPage: false,
        priceRange: priceRange ? priceRange : false,
        type: type,
        brand: brand ? brand : false,
        sort: sort,
      });
    }
  }

  let activeFilters;

  if (priceRange || brand) {
    activeFilters = true;
  }

  // console.log(pageIndex);

  res.render("products", {
    title: `${type}s page`,
    products,
    pageIndex,
    productsPerPage,
    page,
    selectedProductsPerPage,
    priceRange,
    selectedPriceFilter,
    type,
    totalProducts,
    brand,
    selectedBrandFilter,
    sort,
    selectedSortFilter,
    activeFilters,
  });
});

router.get("/products-category", async (req, res) => {
  const totalHeadphones = (await getAllProducts("headphones")).length;

  const totalMouses = (await getAllProducts("mouse")).length;

  const totalKeyboards = (await getAllProducts("keyboard")).length;

  res.render("products-category", {
    title: "Category",
    totalHeadphones,
    totalKeyboards,
    totalMouses,
  });
});

module.exports = router;
