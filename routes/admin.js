const path = require("path");

const { body } = require("express-validator");

const express = require("express");

const isAuth = require("../middleware/is-auth");

const adminController = require("../controllers/admin");

const router = express.Router();

// /admin/products => GET
router.get("/products", adminController.getProducts);

// /admin/add-product => GET
router.get("/add-product", isAuth, adminController.getAddProduct);

// /admin/add-product => POST
router.post(
  "/add-product",
  [
    body("title").isString().isLength({ min: 3 }).trim(),

    body("price").isFloat(),
    body("description").isLength({ min: 5, max: 400 }).trim(),
  ],
  adminController.postAddProduct
);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post(
  "/edit-product",
  [
    body("title").isString().isLength({ min: 3 }).trim(),

    body("price").isFloat(),
    body("description").isLength({ min: 5, max: 400 }).trim(),
  ],
  isAuth,
  adminController.postEditProduct
);

router.post("/delete-product", isAuth, adminController.postDeleteProduct);

module.exports = router;
