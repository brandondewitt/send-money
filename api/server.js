const routes = require("./routes");
const http = require("http");
const port = process.env.PORT || 3000;
const host = process.env.HOST || "127.0.0.1";

const srv = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:9000");
  res.setHeader("Access-Control-Expose-Headers", "x-meta-result-count");
  routes.forEach(route => {
    if (
      route.location.split("/")[1] === req.url.split("/")[1] &&
      route.method === req.method
    ) {
      route.handler.call(this, req, res);
    }
  });
});

srv.listen(port, host, () => {
  console.log("Server running on", "http://" + host + ":" + port);
});
