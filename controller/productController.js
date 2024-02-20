const { default: axios } = require("axios");
const Product = require("../model/Product");

module.exports.initializeToDatabase = async (req, res) => {
  try {
    const response = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );

    const product = response.data;

    await Product.insertMany(product);

    res.status(200).json({ message: "Database initialized successfully" });
  } catch (error) {
    console.error("Error initializing database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
