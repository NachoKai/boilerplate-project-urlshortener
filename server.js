require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const shortId = require("shortid");
const jsonParser = bodyParser.json();
const port = process.env.PORT || 3000;
const expression = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/gi;
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
    if (err) {
      console.error(err);
    } else if (requestedUrl.match(regex)) {
      res.json({
        short_url: url.short_url,
        original_url: url.original_url,
        uuid: url.uuid,
      });
    } else {
      res.json({ error: "Invalid URL" });
    }
  });
});

app.get("/api/shorturl/:uuid", (req, res) => {
  const userGeneratedUuid = req.params.uuid;

  ShortUrl.findOne({ uuid: userGeneratedUuid }).then(foundUrl => {
    res.redirect(foundUrl.original_url);
  });
});

app.route('/api/shorturl/new').post((req,res)=> {
  ...
    let urlMatch = // Match the URL to expected structure or not

    // Lookup the matched URL
    dns.lookup(urlMatch, (err,add,fam) => {
      // If the URL does not exist, return expected error
      if (err) return res.json({"error": "invalid URL"});
   
      // Save to database, otherwise.
    })
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

