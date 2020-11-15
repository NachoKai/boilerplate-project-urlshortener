require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongodb = require("mongodb");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const shortId = require("shortid");
const jsonParser = bodyParser.json();
const app = express();
const port = process.env.PORT || 3000;

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/shorturl/new/", jsonParser, (req, res) => {
  let requestedUrl = req.body.url;
  let uuid = shortId.generate();
  res.json({
    short_url: uuid,
    original_url: requestedUrl,
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
