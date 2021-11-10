const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');


app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//---------------------------------------//

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hellow <b>World</b></body></html>\n');
});

app.get('/urls', (req, res) => {
  const templateVars = {urls: urlDatabase, username: req.cookies['username']};
  res.render('urls_index', templateVars);
});


//new route to render a form for new urls, this must be declared before /urls/:shortURL or the calls to /urls/new will be handled by /urls/:shortURL.
app.get('/urls/new', (req, res) => {
  const templateVars = {username: req.cookies['username']};
  res.render('urls_new', templateVars);
});

//--------------------------------------------------------------------------------------------//

//new route to render urls_show,ejs template.
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[`${req.params.shortURL}`], username: req.cookies['username']};
  res.render("urls_show", templateVars);
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

//redirects to the long URL
app.get("/u/:shortURL", (req, res) => {
  let long;
  const templateVars = urlDatabase;
  if (templateVars[req.params.shortURL]) {
    long = templateVars [req.params.shortURL];
  }
  res.redirect(long);
});


//Deals with username handling.
app.post('/login', (req, res) => {
  const userName = req.body.username;
  res.cookie('username', userName,);
  res.redirect('/urls');
});

//Deals with username handling.
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

//deletes the value from the Database
app.post("/urls/:shortURL/delete", (req, res) => {
  const templateVars = urlDatabase;
  if (templateVars.hasOwnProperty(req.params.shortURL)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  }
});

//recieves data from url_show.jes and deals with edditing the long URL
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.updatedURL;
  res.redirect("/urls");
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