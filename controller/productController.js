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

module.exports.getBarChartData = async (req, res) => {
  try {
    const { month } = req.query;

    const monthCondition = month
      ? { $expr: { $eq: [{ $month: "$dateOfSale" }, parseInt(month)] } }
      : {};

    const barChartData = await Product.aggregate([
      { $match: monthCondition },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lte: ["$price", 100] }, then: "0 - 100" },
                { case: { $lte: ["$price", 200] }, then: "101 - 200" },
                { case: { $lte: ["$price", 300] }, then: "201 - 300" },
                { case: { $lte: ["$price", 400] }, then: "301 - 400" },
                { case: { $lte: ["$price", 500] }, then: "401 - 500" },
                { case: { $lte: ["$price", 600] }, then: "501 - 600" },
                { case: { $lte: ["$price", 700] }, then: "601 - 700" },
                { case: { $lte: ["$price", 800] }, then: "701 - 800" },
                { case: { $lte: ["$price", 900] }, then: "801 - 900" },
              ],
              default: "901-above",
            },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({ barChartData });
  } catch (error) {
    console.error("Error getting bar chart data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
