const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render('urls_index', templateVars);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hellow <b>World</b></body></html>\n');
});

//new route to render a form for new urls, this must be declared before /urls/:shortURL or the calls to /urls/new will be handled by /urls/:shortURL.
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});


//post request from urls_new.ejs. this handles with the response from that post form.
app.post("/urls", (req, res) => {
  const templateVars = urlDatabase;
  let short = generateRandomString();
  while (Object.values(templateVars).indexOf(short) > -1) {//while loopn ensures a unique key
    short = generateRandomString();
  }
  if (Object.values(templateVars).indexOf(req.body.longURL) === -1) {//if value is not repeated in the database it will be added with the unique token.
    urlDatabase[short] = req.body.longURL;
  } else {
    for (let keys in templateVars) {//if the value exists then the value from the database takes precedent.
      if (templateVars[keys] === req.body.longURL) {
        short = keys;
      }
    }
  }
  res.redirect(`/urls/${short}`);
});

//deletes the value from the Database
app.post("/urls/:shortURL/delete", (req, res) => {
  const templateVars = urlDatabase;
  if (templateVars.hasOwnProperty(req.params.shortURL)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } 
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.updatedURL
  res.redirect("/urls");
});


app.get("/u/:shortURL", (req, res) => {
  let long;
  const templateVars = urlDatabase;
  if (templateVars [req.params.shortURL]) {
    long = templateVars [req.params.shortURL];
  }
  res.redirect(long);
});


//new route to render urls_show,ejs template.
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[`${req.params.shortURL}`]};
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




//function that generates a random tinyUrl
let generateRandomString = function() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  while (result.length < 6) {
    result += characters.charAt(Math.floor(Math.random() * 62));
  }
  return result;
};