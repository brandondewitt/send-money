const uuid = require("uuid");
const user = require("./user");
const currencies = require("./currencies");
const descriptions = require("./transactionDescriptions");

const transactions = [];

const transactionCount = 100 * 250;

for (let i = 100; i <= transactionCount; i += 100) {
  //alternate description to be a little random
  descriptions.unshift(descriptions.pop());
  //alternate currency to be a little random
  currencies.unshift(currencies.pop());

  transactions.push({
    id: uuid.v4(),
    payer: user,
    payee: { id: uuid.v4(), name: "User " + i },
    amount: {
      total: i,
      currency: currencies[0]
    },
    timestamp: Date.now(),
    message: "",
    description: descriptions[0]
  });
}

module.exports = transactions;
