const {
  getProductById,
  addComment,
  deleteComment,
  pagination,
  getAllPosts,
  paginateByPrice,
  getAllProductsByPrice,
  getAllProductsByType,
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
    let finalRating = (totalRating / totalReviews).toFixed(1);
    res.render("details", {
      title: `${product.title}`,
      product,
      finalRating,
      totalReviews,
      productId,
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

    const commentInfo = {
      _id: new ObjectId(),
      username: `${req.session.user.firstName} ${req.session.user.lastName}`,
      rating: req.body.rating,
      comment: req.body.comment,
      owner: req.session.user._id,
      productId: req.params.id,
      userImage: req.session.user.image,
    };

    await addComment(req.params.id, commentInfo);
    res.redirect("/details/" + req.params.id);
  } catch (err) {
    console.error(err.message);
    const errors = mapErrors(err);
    const product = await getProductById(req.params.id);
    res.render("details", { title: `${product.title}`, errors, product });
  }
});

router.get(
  "/deleteComment/:productId/:commentId",
  isUser(),
  async (req, res) => {
    try {
      await deleteComment(req.params.productId, req.params.commentId);
      res.redirect("/details/" + req.params.productId);
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

  if (type != "mouse" && type != "keyboard" && type != "headphones") {
    res.redirect("/products");
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

    let from = Number(priceRange.split("/")[0]);
    let to = Number(priceRange.split("/")[1]);

    products = await paginateByPrice(page - 1, productsPerPage, from, to, type);
    totalProducts = (await getAllProductsByPrice(from, to, type)).length;
  } else {
    products = await pagination(page - 1, productsPerPage, type);
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
      });
    } else {
      pageIndex.push({
        page: i,
        productsPerPage: productsPerPage,
        currentPage: false,
        priceRange: priceRange ? priceRange : false,
        type: type,
      });
    }
  }

  // console.log(pageIndex);

  res.render("products", {
    title: "Products Page",
    products,
    pageIndex,
    productsPerPage,
    page,
    selectedProductsPerPage,
    priceRange,
    selectedPriceFilter,
    type,
    totalProducts,
  });
});

router.get("/products", async (req, res) => {
  res.send("products page");
});

// router.get("/products", async (req, res) => {
//   let page = req.query.page || 1;
//   let productsPerPage = Number(req.query.productsPerPage) || 5;
//   let priceRange = req.query.priceRange;

//   if (page < 1) {
//     page = 1;
//   }

//   if (productsPerPage < 5) {
//     productsPerPage = 5;
//   } else if (
//     (productsPerPage > 5 && productsPerPage < 10) ||
//     (productsPerPage > 10 && productsPerPage < 15)
//   ) {
//     productsPerPage = 10;
//   } else if (productsPerPage > 15) {
//     productsPerPage = 15;
//   }

//   let selectedProductsPerPage = {
//     selectedFive: productsPerPage == 5,
//     selectedTen: productsPerPage == 10,
//     selectedFifteen: productsPerPage == 15,
//   };

//   let products;

//   let selectedPriceFilter;

//   if (priceRange) {
//     if (
//       priceRange != "10/40" &&
//       priceRange != "40/80" &&
//       priceRange != "80/140" &&
//       priceRange != "140/200" &&
//       priceRange != "200/400"
//     ) {
//       priceRange = "10/40";
//     }

//     selectedPriceFilter = {
//       priceFilterOne: priceRange == "10/40",
//       priceFilterTwo: priceRange == "40/80",
//       priceFilterThree: priceRange == "80/140",
//       priceFilterFour: priceRange == "140/200",
//       priceFilterFive: priceRange == "200/400",
//     };

//     let from = Number(priceRange.split("/")[0]);
//     let to = Number(priceRange.split("/")[1]);

//     products = await paginateByPrice(page - 1, productsPerPage, from, to);
//     totalProducts = (await getAllProductsByPrice(from, to)).length;
//   } else {
//     products = await pagination(page - 1, productsPerPage);
//     totalProducts = (await getAllPosts()).length;
//   }

//   // const totalProducts = await getAllPosts();
//   // const totalPages = Math.ceil(totalProducts.length / productsPerPage);
//   let totalPages = Math.ceil(totalProducts / productsPerPage);

//   let pageIndex = [];

//   for (let i = 1; i <= totalPages; i++) {
//     if (page == i) {
//       pageIndex.push({
//         page: i,
//         productsPerPage: productsPerPage,
//         currentPage: true,
//         priceRange: priceRange ? priceRange : false,
//       });
//     } else {
//       pageIndex.push({
//         page: i,
//         productsPerPage: productsPerPage,
//         currentPage: false,
//         priceRange: priceRange ? priceRange : false,
//       });
//     }
//   }

//   console.log(totalPages);

//   // console.log(pageIndex);

//   res.render("products", {
//     title: "Products Page",
//     products,
//     pageIndex,
//     productsPerPage,
//     page,
//     selectedProductsPerPage,
//     priceRange,
//     selectedPriceFilter,
//   });
// });

module.exports = router;
