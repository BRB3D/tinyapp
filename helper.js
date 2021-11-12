const generateRandomString = function() {
  return Math.random().toString(36).substr(2,6);
};

const checkEmail = function(newEmail, userDatabase) {
  for (let keys in userDatabase) {
    if (userDatabase[keys].email === newEmail) {
      return userDatabase[keys];
    }
  }
  return true;
};

const urlsForUser = function(logID, urlDatabase) {
  const urls = {};
  for (let keys in urlDatabase) {
    if (urlDatabase[keys].userID === logID) {
      urls[keys] = urlDatabase[keys];
    }
  }
  return urls;
};


module.exports = {generateRandomString, checkEmail, urlsForUser};