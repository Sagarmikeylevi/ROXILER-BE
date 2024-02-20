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

module.exports.getStatistics = async (req, res) => {
  try {
    const { month } = req.query;

    const monthCondition = month
      ? { $expr: { $eq: [{ $month: "$dateOfSale" }, parseInt(month)] } }
      : {};

    const statistics = await Product.aggregate([
      { $match: monthCondition },
      {
        $group: {
          _id: null,
          totalSaleAmount: { $sum: "$price" },
          totalSoldItems: {
            $sum: { $cond: { if: "$sold", then: 1, else: 0 } },
          },
          totalNotSoldItems: {
            $sum: { $cond: { if: "$sold", then: 0, else: 1 } },
          },
        },
      },
    ]);

    const { totalSaleAmount, totalSoldItems, totalNotSoldItems } =
      statistics[0];

    res.status(200).json({
      totalSaleAmount,
      totalSoldItems,
      totalNotSoldItems,
    });
  } catch (error) {
    console.error("Error getting statistics:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
