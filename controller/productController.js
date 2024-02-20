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

module.exports.listTransactions = async (req, res) => {
  try {
    const { month, search, page = 1, perPage = 10 } = req.query;

    const monthCondition = month
      ? { $expr: { $eq: [{ $month: "$dateOfSale" }, parseInt(month)] } }
      : {};

    const searchCondition = search
      ? {
          $or: [
            { title: { $regex: new RegExp(search, "i") } },
            { description: { $regex: new RegExp(search, "i") } },
            { price: { $regex: new RegExp(search, "i") } },
          ],
        }
      : {};

    const pipeline = [
      { $match: { ...monthCondition, ...searchCondition } },
      { $skip: (page - 1) * perPage },
      { $limit: parseInt(perPage) },
    ];

    const transactions = await Product.aggregate(pipeline);

    res.status(200).json({ transactions });
  } catch (error) {
    console.error("Error listing transactions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
