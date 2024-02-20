const express = require("express");
const router = express.Router();

const productController = require("../controller/productController");

router.get("/initialize-database", productController.initializeToDatabase);
router.get("/list-transactions", productController.listTransactions);

module.exports = router;
