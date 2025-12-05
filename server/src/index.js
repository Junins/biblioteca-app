const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
require("dotenv").config();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use("/auth", require("./auth/authRoutes"));
app.use("/items", require("./items/itemRoutes"));

app.listen(4000, () => console.log("API rodando na porta 4000"));
