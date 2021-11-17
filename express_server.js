const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
/* const cookieParser = require('cookie-parser'); */
const bcrypt = require('bcryptjs');
const cookieSession = require("cookie-session");
const {generateRandomString, checkEmail, urlsForUser} = require('./helper');



app.set('view engine', 'ejs');
/* app.use(cookieParser()); */
app.use(bodyParser.urlencoded({extended: true}));
app.use(
  cookieSession({
    name: "session",
    keys: ["I like security it's the best", "key2"],
  })
);

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
    password: bcrypt.hashSync("1", 10),
  },
};
//---------------------------------------//

app.get('/', (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
    return;
  }
  if (req.session.user_id && users[req.session.user_id])
    res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hellow <b>World</b></body></html>\n');
});

//*RENDER index page
app.get('/urls', (req, res) => {
  if (!req.session.user_id) {
    res.status(401).send('<a href="/login">Login</a> or <a href="/register">Register </a> before trying to access this page.');
    return;
  }
  if (req.session.user_id && users[req.session.user_id] === undefined) {
    delete req.session.user_id;
    res.status(401).send('<a href="/login">Login</a> or <a href="/register">Register </a> before trying to access this page.');
    return;
  }

  const id = req.session.user_id;
  const templateVars = {urls: urlsForUser(id, urlDatabase), user: users[id]};

  res.render('urls_index', templateVars);
});


//*RENDER New URLS this must be declared before /urls/:shortURL or the calls to /urls/new will be handled by /urls/:shortURL.
app.get('/urls/new', (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
    return;
  }
  const templateVars = {user: users[req.session.user_id]};
  res.render('urls_new', templateVars);
});


//*RENDER urls_registration.
app.get("/register", (req, res) => {
  if (users[req.session.user_id]) {
    return  res.redirect('/urls');
  }
  const templateVars = {user:null};
  res.render("urls_registration",templateVars);
});

//*RENDER ursl_login
app.get('/login', (req,res) => {
 
  if (req.session.user_id) {
    return  res.redirect('/urls');
  }
  const templateVars = {user:null};
  res.render('urls_login', templateVars);
});

//*RENDER urls_show,ejs
app.get("/urls/:shortURL", (req, res) => {
  if (!Object.keys(urlDatabase).includes(req.params.shortURL)) {
    res.status(401).send('That webpage is not on our database');
    return;
  }
  if (!req.session.user_id || (req.session.user_id && users[req.session.user_id] === undefined)) {
    res.status(401).send('<a href="/login">Login</a> or <a href="/register">Register </a> before trying to access this page');
    return;
  }
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.user_id]};
  const userUrls = Object.keys(urlsForUser(req.session.user_id, urlDatabase));
  if (!userUrls.includes(req.params.shortURL)) {
    res.status(401).send('You are not autorized.');
  }
  res.render("urls_show", templateVars);
});

//--------------------------------------------------------------------------------------------//

//POST from urls_new.ejs creates random string and redirects to /urls/shortURL ***************
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.status(400).send(`Dont be cheeky`);
    return;
  }
  const id = req.session.user_id;
  const templateVars = urlsForUser(id, urlDatabase);
  let short = generateRandomString();
  while (Object.keys(templateVars).indexOf(short) > -1) {//while loop ensures a unique key
    short = generateRandomString();
  }
  for (const keys in templateVars) {//if the value exists then the value from the database takes precedent.
    if (templateVars[keys].longURL === req.body.longURL) {
      short = keys;
      return res.redirect(`/urls/${short}`);
    }
  }
  urlDatabase[short] = { longURL: req.body.longURL, userID: req.session.user_id};
  res.redirect(`/urls/${short}`);
});

//RDIRECTS to Actual web page if it extists.
app.get("/u/:shortURL", (req, res) => {
  let long = null;
  const templateVars = urlDatabase;
  if (!templateVars[req.params.shortURL]) {
    res.status(400).send(`${req.params.shortURL} doesnt exist`);
    return;
  }
  if (templateVars[req.params.shortURL]) {
    long = templateVars[req.params.shortURL].longURL;
  }
  return res.redirect(long);
});

//POST from /register stores or checks users in database ****************
app.post('/register', (req, res) => {
  let id = generateRandomString();
  const {email, password} = req.body;
  if (!req.body.password || !req.body.email) {
    return res.status(400).send('Password or Email empty');
  }
  if (typeof checkEmail(email, users) === 'object') {
    return res.status(400).send(`Email ${email} already exists. Dont be cheeky`);
  }
  while (Object.keys(users).indexOf(id) > -1) {//while loop ensures a unique Id
    id = generateRandomString();
  }
  const userWithId = {
    id,
    email,
    password: bcrypt.hashSync(password, 10),
  };
  users[id] = userWithId;
  req.session.user_id = id;
  res.redirect('/urls');
});


//POST from login ****************
app.post('/login', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
    return;
  }
  const email = req.body.email;
  const password = req.body.password;
  if (typeof checkEmail(email, users) === 'object') {
    const key = checkEmail(email, users);
    if (bcrypt.compareSync(password, key.password)) {
      req.session.user_id = key.id;
      res.redirect('/urls');
      return;
    }
    return res.status(403).send(`Password doesnt match`);
  }
  return res.status(403).send(`This email: ${email} cannot be found`);
});

//POST from logout *****************
app.post('/logout', (req, res) => {
  delete req.session.user_id;
  res.redirect('/login');
});

//POST deletes the value from the Database ********************
app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.session.user_id;
  if (!id) {
    res.status(401).send('Stop, its a trap!!!');
    return;
  }
  const userUrls = Object.keys(urlsForUser(id, urlDatabase));
  if (userUrls.includes(req.params.shortURL)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
    return;
  }
  res.status(401).send('ID not authorized to edit or delete this URL');
  return;
});

//POST from url_show.jes and deals with edditing the long URL ****************
app.post("/urls/:shortURL", (req, res) => {
  const userUrls = urlsForUser(req.session.user_id, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.shortURL)) {
    for (const url in userUrls) {
      if (userUrls[url].longURL === req.body.updatedURL) {
        res.redirect('/urls');
        return;
      }
    }
    urlDatabase[req.params.shortURL] = {longURL: req.body.updatedURL, userID: req.session.user_id};
    res.redirect('/urls');
    return;
  }
  if (!req.session.user_id || !Object.keys(userUrls).includes(req.params.shortURL)) {
    res.status(401).send('Not Authorized');
    return;
  }
  res.redirect('/urls');
  return;
});





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


