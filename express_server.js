const express = require('express');
const app = express();
const PORT = 8080;

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
  res.render('urls_index', templateVars)
})
app.get('/hello', (req, res) => {
  res.send('<html><body>Hellow <b>World</b></body></html>\n');
});

//new route to render a form for new urls, this must be declared before /urls/:shortURL or the calls to /urls/new will be handled by /urls/:shortURL. 
app.get('/urls/new', (req, res) => {
  res.render('urls_new')
})

//new route to render urls_show,ejs template.
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[`${req.params.shortURL}`]};
  res.render("urls_show", templateVars);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});