const currencies = require("../mocks/currencies");

module.exports = [
  {
    method: "GET",
    location: "/currencies",
    handler: (req, res) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(currencies));
    }
  }
];
