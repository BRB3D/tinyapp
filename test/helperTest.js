const { assert } = require('chai');

const { checkEmail } = require('../helper.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('checkEmail', function() {
  it('should return a user with valid email', function() {
    const user = checkEmail("user@example.com", testUsers).id
    const expectedUserID = "userRandomID";
    assert.strictEqual(user, expectedUserID);
  });
});
describe('checkEmail', function() {
  it('should return a user with valid email', function() {
    const user = checkEmail("user3@example.com", testUsers).id
    const expectedUserID = undefined;
    assert.strictEqual(user, expectedUserID);
  });
});
