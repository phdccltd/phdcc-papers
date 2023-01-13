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
// Add 4..8
users.recapturer = {
  "name": "Recapturer", // 9
  "username": "recapturer",
  "email": "recapturer@example.com",
  "password": "userecapture",
  "roles": "Author"
}


module.exports = {
  users
}
