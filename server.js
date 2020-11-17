require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const shortId = require("shortid");
const jsonParser = bodyParser.json();
const port = process.env.PORT || 3000;
const expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
const regex = new RegExp(expression);
const app = express();

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const ShortUrl = mongoose.model(
  "ShortUrl",
  new mongoose.Schema({
    short_url: String,
    original_url: String,
    uuid: String,
  })
);

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/shorturl/new/", jsonParser, (req, res) => {
  const requestedUrl = req.body.url;
  let uuid = shortId.generate();

  const newURL = new ShortUrl({
    short_url: "https://corty.herokuapp.com/api/shorturl/" + uuid,
    original_url: requestedUrl,
    uuid: uuid,
  });

  newURL.save((err, url) => {
    if (err) console.error(err);

    res.json({
      short_url: url.short_url,
      original_url: url.original_url,
      uuid: url.uuid,
    });
  });
});

app.get("/api/shorturl/:uuid", (req, res) => {
  const userGeneratedUuid = req.params.uuid;

  ShortUrl.findOne({ uuid: userGeneratedUuid }).then(foundUrl => {
    res.redirect(foundUrl.original_url);
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
