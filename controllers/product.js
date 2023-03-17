const {
  getProductById,
  addComment,
  deleteComment,
  pagination,
  getAllPosts,
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

router.get("/products", async (req, res) => {
  const page = req.query.page || 1;
  const productsPerPage = req.query.productsPerPage || 5;
  const products = await pagination(page - 1, productsPerPage);

  const totalProducts = await getAllPosts();
  const totalPages = Math.ceil(totalProducts.length / productsPerPage);
  let pageIndex = [];

  for (let i = 1; i <= totalPages; i++) {
    if (page == i) {
      pageIndex.push({
        page: i,
        productsPerPage: productsPerPage,
        currentPage: true,
      });
    } else {
      pageIndex.push({
        page: i,
        productsPerPage: productsPerPage,
        currentPage: false,
      });
    }
  }

  let selectedProductsPerPage = {
    selectedFive: false,
    selectedTen: false,
    selectedFifteen: false,
  };

  if (productsPerPage == 5) {
    selectedProductsPerPage.selectedFive = true;
  } else if (productsPerPage == 10) {
    selectedProductsPerPage.selectedTen = true;
  } else if (productsPerPage == 15) {
    selectedProductsPerPage.selectedFifteen = true;
  }

  console.log(page);
  console.log(productsPerPage);
  console.log(pageIndex);

  res.render("products", {
    title: "Products Page",
    products,
    pageIndex,
    productsPerPage,
    page,
    selectedProductsPerPage,
  });
});

module.exports = router;
