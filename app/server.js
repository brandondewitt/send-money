const fs = require("fs");
const http = require("http");
const port = process.env.PORT || 9000;
const host = process.env.HOST || "127.0.0.1";
const path = require("path");
const javascript = fs.readFileSync(path.join(__dirname, "index.js"));

const srv = http.createServer((req, res) => {
  switch (req.url) {
    case "/":
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="stylesheet" href="app.css">
          </head>

          <body>
            <div id="app" class="layout-column"></div>
            <script src="index.js"></script>
          </body>
        </html>
      `);
      break;
    case "/index.js":
      res.writeHead(200, { "Content-Type": "application/javascript" });
      res.end(javascript);
      break;
    case "/app.css":
      const css = fs.readFileSync(path.join(__dirname, "app.css"));
      res.writeHead(200, { "Content-Type": "text/css" });
      res.end(css);
      break;
    case "/loading.gif":
      const loadingImage = fs.readFileSync(path.join(__dirname, "loading.gif"));
      res.writeHead(200, { "Content-Type": "image/gif" });
      res.end(loadingImage);
      break;
    default:
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end(`
        <!DOCTYPE html>
        <html>
          <head>
          </head>

          <body>
            Whoops, this page doesn't exist
          </body>
        </html>
      `);
      break;
  }
});

srv.listen(port, host, () => {
  console.log("Server running on", "http://" + host + ":" + port);
});
