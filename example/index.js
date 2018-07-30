const microCors = require("micro-cors");
const { router, get } = require("microrouter");
const { send } = require("micro");
const fs = require("fs");
const path = require("path");

const cors = microCors({ allowMethods: ["GET"] });

module.exports = cors(
  router(
    get("/person/:id", req => {
      return {
        id: req.params.id,
        name: "conor",
        type: "cool guy",
        stuffIdontcareabout: "christophercolumbus"
      };
    }),
    get("/post/:id", req => {
      return {
        id: req.params.id,
        title: "stuff cool people do",
        body: "surf",
        stuffIdontcareabout: "christophercolumbus"
      };
    }),
    get("/todos", req => {
      return Array.from({ length: 10 }).map((_, i) => ({
        id: i + 1,
        todo: "all of these are the same",
        complete: Math.random() > 0.5 ? true : false,
        somethingElse: "whatever"
      }));
    }),
    get("/", req =>
      fs.readFileSync(path.join(__dirname, "build", "index.html"), "utf-8")
    ),
    get('/*', (req, res) => {
      try {
        return fs.readFileSync(path.join(__dirname, "build", req.url), "utf-8");
      }
      catch (e) {
        console.error(e);
        send(res, 404, "file not found");
      }
    })
  )
);
