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
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  i3Botr: { longURL: "https://www.google.ca", userID: "hsdjfgh" }
};

const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: "123"
  }
}

// Helper functions
const urlsForUser = function(id){
  let result= {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id){
      result[url] = {
        longURL: urlDatabase[url].longURL,
        userID: urlDatabase[url].userID
      }
    }
  }
  return result;
}

const emailExist = function (email){
  for(let key in users){
    if(users[key].email===email) return true;
  return false;
  }
}
//getUserbyEmail and returns user object login & register
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
  const userID = req.cookies.id;
  if(!userID) {
    res.redirect("/login")
  }

  res.redirect("/urls");
});

// /login
app.get("/login", (req, res) => {
  let templateVars;
  const id = req.cookies.id;
  if(id) {
    res.redirect("/urls");
    return;
  }
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
res.render("urls_login", templateVars);
});

app.post("/login", function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

//If email is already been used
  if(!emailExist(email)) {
    res.status(403);
    res.send('Email not found');
    return;
  } 

    //bccrypt.compare
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
});

// /register
app.get("/register", (req, res) => {
  let templateVars;
  const id = req.cookies.id;
  if(id) {
    res.redirect("/urls");
    return;
  }
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

    //******hash function
    const newUser = { id, email, password }
    users[id] = newUser;
    res.cookie("id", id);
    res.redirect("/urls");
  }
});

// /urls
app.get("/urls", (req, res) => {
  let templateVars;
  const userID = req.cookies.id;
  if(!userID) {
    res.status(403);
    res.send('You have to register/login first');
    return;
  }

  let user=null;
  for(const key in users) {
    if(key === userID) {
      user = users[key];
    }
  }

  templateVars = {
    user,
    urls: urlsForUser(userID)
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
  if(!urlsForUser(id).userID === id) {
    const longURL = urlDatabase[id].longURL;
    res.send('Did you created this short URL? You have to register/login first to access it');
  }
   

  let user = null;
  for(const key in users) {
    if(key === id) {
      user = users[key];
    }
  }

  if(!id) {
    res.send('User not logged in');
    return;
  }

    const shortURL = req.params.shortURL;
    const urlRecord = urlDatabase[shortURL];
    if(!urlRecord) {
      res.status(403);
      res.send('Short URL not found'); 
      return;
    }

    const longURL = urlRecord.longURL;

    let templateVars = {
      user,
      urls: urlsForUser(id),
      shortURL,
      longURL
    }
  res.render("urls_show", templateVars);
});

// /u/:shortURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const urlRecord = urlDatabase[shortURL];
  const longURL = urlRecord.longURL;
  if(!urlRecord) {
    res.status(403);
    res.send('Short URL not found'); 
    return;
  }
  res.redirect(longURL);
});



// /urls/:id
app.post("/urls/:id", (req, res) => {
  const userID = req.cookies.id;
  if(!userID) {
    res.status(403);
    res.send('No user');
    return;
  }

  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  const urlRecord = { longURL, userID };
  urlDatabase[shortURL] = urlRecord;
  res.redirect("/urls");
});

// /urls/:shortURL/delete
app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.cookies.id;
  if(!id) {
    res.status(403);
    res.send('No user');
    return;
  }

  const shortURL = req.params.shortURL;
  const urlRecord = urlDatabase[shortURL];
  if(!urlRecord || urlRecord.userID !== id) {
    res.status(403);
    res.send('Not allowed');
    return;
  }

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// /logout
app.post('/logout', function (req, res) {
  res.clearCookie("id");
  res.redirect("/urls");
});

////// LISTEN
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

