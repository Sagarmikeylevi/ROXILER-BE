const express = require("express");
const router = express.Router();

const productController = require("../controller/productController");

router.get("/initialize-database", productController.initializeToDatabase);

module.exports = router;
