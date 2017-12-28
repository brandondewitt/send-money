const descriptions = require("../mocks/transactionDescriptions");

module.exports = [
  {
    method: "GET",
    location: "/descriptions",
    handler: (req, res) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(descriptions));
    }
  }
];
