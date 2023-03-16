const {
  getProductById,
  addComment,
  deleteComment,
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
  const commentInfo = {
    _id: new ObjectId(),
    username: `${req.session.user.firstName} ${req.session.user.lastName}`,
    rating: req.body.rating,
    comment: req.body.comment,
    owner: req.session.user._id,
    productId: req.params.id,
    userImage: req.session.user.image,
  };

  try {
    await addComment(req.params.id, commentInfo);
    res.redirect("/details/" + req.params.id);
  } catch (err) {
    console.error(err);
    const errors = mapErrors(err);
    res.render("details", { title: "Details", errors });
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

module.exports = router;
