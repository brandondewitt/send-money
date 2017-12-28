const user = require("./user");
const descriptions = require("./descriptions");
const currencies = require("./currencies");
const transactions = require("./transactions");

const routes = [].concat(user, descriptions, currencies, transactions);

const routeLocations = routes.map(route => ({
  method: route.method,
  location: route.location
}));

routes.unshift({
  method: "GET",
  location: "/",
  handler: (req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(routeLocations));
  }
});

module.exports = routes;
