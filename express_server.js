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
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

console.log(urlDatabase);

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  }
}

// Helper functions
const emailExist = function (email){
  for(let key in users){
    if(users[key].email===email) return true;
  return false;
  }
}

const passwordExist = function (email, password){
  for(let key in users){
    if(users[key].email===email && users[key].password===password){
      return true;
    }
  }
  return false;
};

const setId = function (email, password){
  for(let key in users){
    if(users[key].email===email && users[key].password===password){
      return users[key].id;
    }
  }
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
  let userID = req.cookies.id;
  urlDatabase[shortURL] = {longURL, userID};
  res.redirect(`/urls/${shortURL}`);
});
// /login
app.get("/login", (req, res) => {
  let templateVars;
  const id = req.cookies.id;
  let user = null;
  for(const key in users) {
    if(key === id) {
      user = users[key];
    }
  }
  templateVars = { user,
    urls: urlDatabase,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  }
res.render("urls_login", templateVars);
});

app.post("/login", function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

//If email is already been used
  if(!emailExist(email)) {
    res.status(403);
    res.send('Email not found'); 
  } else {
    for(const key in users) {
      if (!passwordExist(email, password)) {
        res.status(403);
        res.send('Password does not match');
      } else {
        let id = setId(email, password);
        res.cookie("id", id)
        res.redirect("/urls");
      }
    }
  }
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
  
  const email = req.body.email;
  const password = req.body.password;
  //If email or password are blank
  if(email==="" || password === ""){
    res.status(400);
    res.send('Email or password are blank');
  }

  //If email is already been used
  if(emailExist(email)) {
    res.status(400);
    res.send('Email already registered. Login instead');
  } else {
    const id = generateRandomString();
    const newUser = { id, email, password }
    users[id] = newUser;
    res.cookie("id", id);
    res.redirect("/urls");
  }
});

// /urls/new
app.get("/urls/new", (req, res) => {
  const id = req.cookies.id;
  let user= null;
  for(const key in users) {
    if(key === id) {
      user = users[key];
    }
  }
  let templateVars = { user, urls: urlDatabase}
  if(req.cookies.id) res.render("urls_new", templateVars);
  res.render("urls_login", templateVars);
});

// /urls/:shortURL
app.get("/urls/:shortURL", (req, res) => {
    const id = req.cookies.id;
    let user = null;
    for(const key in users) {
      if(key === id) {
        user = users[key];
      }
    }
    let templateVars = {
      user,
      urls: urlDatabase,
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL
    }
  res.render("urls_show", templateVars);
});


// /u/:shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
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

