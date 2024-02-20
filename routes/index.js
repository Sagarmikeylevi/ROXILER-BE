const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send(`<h1> ** Roxiler API ** </h1>`);
});

router.use("/product", require("./product"));

console.log("Routes are running fine");
module.exports = router;
