const user = require("../mocks/user");
const transactions = require("../mocks/transactions");
const uuid = require("uuid");
const querystring = require("querystring");

module.exports = [
  {
    method: "GET",
    location: "/transactions/" + user.id,
    handler: (req, res) => {
      const params = querystring.parse(req.url.split("?")[1]);
      res.writeHead(200, {
        "Content-Type": "application/json",
        "x-meta-result-count": transactions.length
      });
      res.end(
        JSON.stringify(
          transactions.slice(
            Number(params.offset),
            Number(params.offset) + Number(params.limit)
          )
        )
      );
    }
  },
  {
    method: "POST",
    location: "/transactions",
    handler: (req, res) => {
      var body = "";
      req.on("data", function(data) {
        body += data;
      });
      req.on("end", function() {
        const transaction = JSON.parse(body);
        const payee = {
          id: uuid.v4(),
          name: "John Doe",
          email: transaction.payee
        };
        transaction.id = uuid.v4();
        transaction.payee = payee;
        res.writeHead(201, { "Content-Type": "application/json" });
        setTimeout(() => res.end(JSON.stringify(transaction)), 800);
      });
    }
  }
];
