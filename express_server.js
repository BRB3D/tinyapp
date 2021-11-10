const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');


app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

// ----------------------- ShortURL & LongURL Database---------------//
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//----------------------- User registration Database ---------------------//
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
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

//*RENDER index page
app.get('/urls', (req, res) => {
  const templateVars = {urls: urlDatabase, user: users[req.cookies['user_id']]};
  res.render('urls_index', templateVars);
});


//*RENDER New URLS this must be declared before /urls/:shortURL or the calls to /urls/new will be handled by /urls/:shortURL.
app.get('/urls/new', (req, res) => {
  const templateVars = {user: users[req.cookies['user_id']]};
  res.render('urls_new', templateVars);
});


//*RENDER urls_registration.
app.get("/register", (req, res) => {
  
  res.render("urls_registration");
});

//*RENDER urls_show,ejs
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[`${req.params.shortURL}`], user: users[req.cookies['user_id']]};
  res.render("urls_show", templateVars);
});

//--------------------------------------------------------------------------------------------//

//POST from urls_new.ejs creates random string and rediredts to /urls/shortURL ***************
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

//RDIRECTS to Actual web page if it extists.
app.get("/u/:shortURL", (req, res) => {
  let long;
  const templateVars = urlDatabase;
  if (templateVars[req.params.shortURL]) {
    long = templateVars [req.params.shortURL];
  }
  res.redirect(long);
});

//POST from /register stores or checks users in database ****************
app.post('/register', (req, res) => {
  if (!req.body.password || !req.body.email) {
    return res.status(400).send('Password or Email empty');
  }
  let id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (!checkEmail(email)) {
    return res.status(400).send('Email already exists. Dont be cheeky');
  }
  const userVars = users;
  while (Object.values(userVars).indexOf(id) > -1) {//while loop ensures a unique Id
    id = generateRandomString();
  }
  const userWithId = {
    id,
    email,
    password,
  };
  users[id] = userWithId;
  res.cookie('user_id', id);
  res.redirect('/urls');
});


//POST from login ****************
app.post('/login', (req, res) => {
  const id = req.body.username;
  console.log(id);
  res.cookie('user_id', id);
  res.redirect('/urls');
});

//POST from logout *****************
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

//POST deletes the value from the Database ********************
app.post("/urls/:shortURL/delete", (req, res) => {
  const templateVars = urlDatabase;
  if (templateVars.hasOwnProperty(req.params.shortURL)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  }
});

//POST from url_show.jes and deals with edditing the long URL ****************
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.updatedURL;
  res.redirect("/urls");
});





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




//function that generates a random tinyUrl
const generateRandomString = function() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  while (result.length < 6) {
    result += characters.charAt(Math.floor(Math.random() * 62));
  }
  return result;
};

const checkEmail = function(newEmail) {
  if (Object.keys(users).length === 0) {
    return true;
  }
  for (let keys in users) {
    if (users[keys].email === newEmail) {
      return false;
    }
  }
  return true;
};