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
  "b2xVn2": {longURL:"http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": {longURL:"http://www.google.com", userID: "userRandomID" },
};
//----------------------- User registration Database ---------------------//
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "1"
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
  if (req.cookies['user_id'] && users[req.cookies['user_id']] === undefined) {
    res.clearCookie('user_id');
    res.redirect('/login');
  }
  const templateVars = {urls: urlDatabase, user: users[req.cookies['user_id']]};
  res.render('urls_index', templateVars);
});


//*RENDER New URLS this must be declared before /urls/:shortURL or the calls to /urls/new will be handled by /urls/:shortURL.
app.get('/urls/new', (req, res) => {
  if (!req.cookies['user_id']) {
    res.redirect('/login');
  }
  const templateVars = {user: users[req.cookies['user_id']]};
  res.render('urls_new', templateVars);
});


//*RENDER urls_registration.
app.get("/register", (req, res) => {
  if (req.cookies['user_id']) {
    return  res.redirect('/urls');
    }
  res.render("urls_registration");
});

//*RENDER ursl_login
app.get('/login', (req,res) => {
  if (req.cookies['user_id']) {
  return  res.redirect('/urls');
  }

  res.render('urls_login');
});

//*RENDER urls_show,ejs
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[`${req.params.shortURL}`].longURL, user: users[req.cookies['user_id']]};
  res.render("urls_show", templateVars);
});

//--------------------------------------------------------------------------------------------//

//POST from urls_new.ejs creates random string and redirects to /urls/shortURL ***************
app.post("/urls", (req, res) => {
  if (!req.cookies['user_id']) {
    res.status(400).send(`Dont be cheeky`);
  }
  const templateVars = urlDatabase;
  let short = generateRandomString();
  while (Object.values(templateVars).indexOf(short) > -1) {//while loop ensures a unique key
    short = generateRandomString();
  }
  for (let keys in templateVars) {//if the value exists then the value from the database takes precedent.
    if (templateVars[keys].longURL === req.body.longURL) {
      short = keys;
      return res.redirect(`/urls/${short}`);
    }
  }
  urlDatabase[short] = { longURL: req.body.longURL, userID: req.cookies['user_id']};
  res.redirect(`/urls/${short}`);
});

//RDIRECTS to Actual web page if it extists.
app.get("/u/:shortURL", (req, res) => {
  let long;
  const templateVars = urlDatabase;
  if(!templateVars[req.params.shortURL]) {
    res.status(400).send(`${req.params.shortURL} doesnt exist`);
  }
  if (templateVars[req.params.shortURL]) {
    long = templateVars[req.params.shortURL].longURL;
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
  if (typeof checkEmail(email) === 'object') {
    return res.status(400).send(`Email ${email} already exists. Dont be cheeky`);
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
  if (req.cookies['user_id']) {
    res.redirect('/urls');
    return;
  }
  const email = req.body.email;
  const password = req.body.password;
  if (typeof checkEmail(email) === 'object') {
    let key = checkEmail(email);
    if (key.password === password) {
      let id = key.id;
      res.cookie('user_id', id);
      res.redirect('/urls');
      return;
    }
    return res.status(403).send(`Password doesnt match`);
  }
  return res.status(403).send(`This email: ${email} cannot be found`);
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
  for (let keys in urlDatabase) {
    if (urlDatabase[keys].longURL === req.body.updatedURL) {
      return  res.redirect('/urls');
    }
  }
  urlDatabase[req.params.shortURL] = {longURL: req.body.updatedURL, userID: req.cookies['user_id']};
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
  for (let keys in users) {
    if (users[keys].email === newEmail) {
      return users[keys];
    }
  }
  return true;
};