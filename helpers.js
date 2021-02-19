// Helper functions
const getUserByEmail = (database, email) => {
  let user = null;
  for (let key in database) {
    if (database[key].email === email) {
      user = database[key];
    }
  }
  return user;
};

const urlsForUser = function(id) {
  let result = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      result[url] = {
        longURL: urlDatabase[url].longURL,
        userID: urlDatabase[url].userID
      };
    }
  }
  return result;
};

const emailExist = function(email) {
  for (let key in users) {
    if (users[key].email === email) return true;
    return false;
  }
};

const generateRandomString = function() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
};

module.exports = { getUserByEmail, urlsForUser, emailExist, generateRandomString}