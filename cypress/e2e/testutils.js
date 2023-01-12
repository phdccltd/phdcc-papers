const users = {};

users.jo = {
  "name": "Jo", // 1
  "username": "jo",
  "email": "jo@example.com",
  "password": "asecret",
  "super": true,
  "roles": "Owner"
}
users.owner1 = {
  "name": "Owner1", // 2
  "username": "owner1",
  "email": "owner1@example.com",
  "password": "owner1pwd",
  "roles": "Owner"
}
users.author1 = {
  "name": "Author1", // 3
  "username": "author1",
  "email": "author1@example.com",
  "password": "author1pwd",
  "roles": "Author"
}

console.log("testutils",users)

module.exports = users
