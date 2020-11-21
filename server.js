require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dns = require("dns");
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT || 3000;
const { Schema } = mongoose;

const connection = mongoose.createConnection(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const autoIncrement = require("mongoose-auto-increment");

autoIncrement.initialize(connection);

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

const urlSchema = new Schema({
  url: String,
});

urlSchema.plugin(autoIncrement.plugin, { model: "URL", field: "urlID" });

const URL = connection.model("URL", urlSchema);

app.use(bodyParser.urlencoded({ extended: false }));

app.post("/api/shorturl/new", (req, res) => {
  const reqURL = req.body.url;
  const regEx = /(?<=(http|https):\/\/)[^\/]+/;
  let urlMatch = reqURL.match(regEx) && reqURL.match(regEx)[0];

  urlMatch = !urlMatch ? "url-to-fail" : urlMatch;

  dns.lookup(urlMatch, (err, add, fam) => {
    if (err) res.json({ error: "invalid URL" });
    else {
      URL.findOne({ url: req.body.url }).exec((err, doc) => {
        if (err) return console.error(err);
        if (doc !== null) {
          res.json({ original_url: req.body.url, short_url: doc.urlID });
        } else {
          let urlObj = new URL({ url: req.body.url });

          urlObj.save(err => {
            if (err) return console.error(err);
            res.json({ original_url: req.body.url, short_url: urlObj.urlID });
          });
        }
      });
    }
  });
});

app.get("/api/shorturl/:id", (req, res) => {
  URL.findOne({ urlID: req.params.id }).exec((err, doc) => {
    if (err) return console.error(err);
    if (doc !== null) res.redirect(doc.url);
    else res.send("Not found");
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
