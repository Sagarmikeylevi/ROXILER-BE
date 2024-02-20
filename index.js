const express = require("express");
const server = express();
require("dotenv").config();
const PORT = process.env.PORT;
const mongoose = require("./config/mongoose");
const cors = require("cors");

server.use(express.json());
server.use(cors());

server.use("/api", require("./routes"));

server.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
