require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const shortId = require("shortid");
let uuid = shortId.generate();
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
  let requestedUrl = req.body.url;

  let newURL = new ShortUrl({
    short_url: __dirname + "/api/shorturl/" + uuid,
    original_url: requestedUrl,
    uuid: uuid,
  });

  newURL.save((err, data) => {
    if (err) {
      console.error(err);
    } else if (requestedUrl.match(regex)) {
      res.json({
        short_url: newURL.short_url,
        original_url: newURL.original_url,
        uuid: newURL.uuid,
      });
    } else {
      res.json({ error: "invalid url" });
    }
  });
});

app.get("/api/shorturl/:uuid", (req, res) => {
  let userGeneratedUuid = req.params.uuid;

  ShortUrl.find({ uuid: userGeneratedUuid }).then(foundUrl => {
    res.redirect(foundUrl[0].original_url);
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
