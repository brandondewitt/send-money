const uuid = require("uuid");
const user = require("../mocks/user");

module.exports = [
  {
    method: "GET",
    location: "/user",
    handler: (req, res) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(user));
    }
  }
];
