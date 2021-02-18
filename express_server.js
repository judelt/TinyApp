const express = require("express");
const bodyParser = require("body-parser");
var morgan = require('morgan')
const cookieParser = require('cookie-parser')

const app = express();
const PORT = 8080; // default port 8080

////// USE
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'))
app.use(cookieParser())

////// SET
app.set("view engine", "ejs");

const generateRandomString = function () {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  }
}

// Helper functions
const checkEmailExists = function (email) {
  for(const key in users){
    if(key === id) {
      user = users[key];
      return true;
    }
  }
  let user=null;
  return false;
}

// Main page
app.get("/", (req, res) => {
  res.send("Hello!");
});

// /urls
app.get("/urls", (req, res) => {
  let templateVars;
  const id = req.cookies.id;
  let user=null;
  for(const key in users) {
    if(key === id) {
      user = users[key];
    }
  }
  templateVars = {
    user,
    urls: urlDatabase
  }
  
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// /register
app.get("/register", (req, res) => {
  let templateVars;
  const id = req.cookies.id;
  let user=null;
  for(const key in users) {
    if(key === id) {
      user = users[key];
    }
  }
  templateVars = {
    user,
    urls: urlDatabase
  }
  res.render("urls_register", templateVars);
});

app.post('/register', function (req, res) {
  
  const id = generateRandomString()
  const newUser = {
    id: id,
    email: req.body.email,
    password: req.body.password
  }
  users[id] = newUser;
  console.log('register form:', req.body)
  res.cookie("id", id)
  res.redirect("/urls");
});

// /urls/new
app.get("/urls/new", (req, res) => {
  let templateVars;
  const id = req.cookies.id;
  let user= null;
  for(const key in users) {
    if(key === id) {
      user = users[key];
    }
  }
  templateVars = {
    user,
    urls: urlDatabase
  }
  res.render("urls_new", templateVars);
});

// /urls/:shortURL
app.get("/urls/:shortURL", (req, res) => {
    let templateVars;
    const id = req.cookies.id;
    let user = null;
    for(const key in users) {
      if(key === id) {
        user = users[key];
      }
    }
    templateVars = {
      user,
      urls: urlDatabase,
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]
    }
  res.render("urls_show", templateVars);
});


// /u/:shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// /login
// const users = {
//   "userRandomID": {
//     id: "userRandomID",
//     email: "user@example.com",
//     password: "purple-monkey-dinosaur"
//   }
// }
app.post('/login', function (req, res) {
  res.cookie("email", req.body.email)
  res.redirect("/urls");
});

// /logout
app.post('/logout', function (req, res) {
  res.clearCookie("id");
  res.redirect("/urls");
});

// /urls/:id
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

// /urls/:shortURL/delete
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

////// LISTEN
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

