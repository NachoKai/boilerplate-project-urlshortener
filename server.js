var express = require("express");
var app = express();
var mod = require("./module");
var path = require("path");

app.use(express.static("public"));
app.use(express.static("views"));

//app.set('views', path.join(__dirname, 'views'));

//using MongoDB and deploying to Herok reference
//https://community.c9.io/t/setting-up-mongodb/1717
//https://github.com/FreeCodeCamp/FreeCodeCamp/wiki/Using-MongoDB-And-Deploying-To-Heroku
// mongod --port 27017 --dbpath=./data
// Now your Db is running at- mongodb://localhost:27017/my_database_name

var port = process.env.PORT || 8080;
app.listen(port, function () {
  console.log("Node.js listening on port " + port);
});

/*
app.get("/", function(req, res) {
    console.log("pasó por /");
    //http://stackoverflow.com/questions/17014384/how-to-render-multiple-ejs-files-in-nested-form-in-node-js-and-express
    res.render('index.html');
    //mod.render(res, 'views', "index.html", []);
});
app.get("/lessons", function(req, res) {
    console.log(req.url);
    console.log("pasó por lessons");
    
    res.render('lessons.html', function(err, html) {
        if(err) {
            console.log(err);
        }
        res.send(html);
    });
});
*/

app.get("*", function (req, res) {
  //var usageReq = false;
  var urlPassed = req.url;
  urlPassed = urlPassed.substring(1, urlPassed.length); //remove first "/"

  /*
    if(urlPassed.length > 6 && urlPassed.substring(0, 5) == "usage") { //seee if usage asked in order to render answer
        //console.log("detectó usage");
        usageReq = true;
        urlPassed = urlPassed.substring(6, urlPassed.length) 
        
    }
    */

  //console.log(urlPassed);
  var expected = mod.seeIfExpected(urlPassed); //returns url(if url) or num(if number) or na(if it doesn't match any)
  //console.log(expected);
  mod.processInfo(expected, urlPassed, function (answer) {
    console.log("showing answer");
    console.log(answer);
    if (
      answer.found == false &&
      answer.jsonRes == true &&
      answer.info != "inserted"
    ) {
      res.json({
        error: answer.info,
      });
    } else {
      /*
            if (usageReq == true) {
                //do something different, if entered number, go to page associated, else render and link strings
                if (answer.found == false) { //means it was an insertion, lets render answer and link it
                //http://stackoverflow.com/questions/10919650/accessing-express-js-local-variables-in-client-side-javascript
                    res.render('render.html', answer);
                
                } else { //means it was found
                    res.render('render.html', answer);
                }
            } else {
                */
      if (answer.jsonRes == true) {
        res.json({
          long_url: answer.url,
          short_url: answer.id,
        });
      } else {
        // go to url
        //if(/https/g.test(answer.url)) {
        res.redirect(answer.url);
        /*} else {
                        console.log("le falta https");
                        var newUrl = "https://" + answer.url;
                        console.log(newUrl);
                        res.redirect(newUrl);
                    }*/
      }
      //}
    }
  });
});
