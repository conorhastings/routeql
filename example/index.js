const microCors = require("micro-cors");
const { router, get, put } = require("microrouter");
const { send, json } = require("micro");
const fs = require("fs");
const path = require("path");

const cors = microCors();

let count = 0;

module.exports = cors(
  router(
    get("/person/:id", (req, res) =>
      send(res, 200, {
        id: req.params.id,
        personName: "conor",
        type: "cool guy",
        stuffIdontcareabout: "christophercolumbus"
      })
    ),
    get("/post/:id", (req, res) =>
      send(res, 200, {
        id: req.params.id,
        title: "stuff cool people do",
        body: "surf",
        metadata: {
          author: "conor hastings",
          wow: "ok"
        },
        stuffIdontcareabout: "christophercolumbus"
      })
    ),
    get("/todos", (_, res) =>
      send(
        res,
        200,
        Array.from({ length: 10 }).map((_, i) => ({
          id: i + 1,
          todo: "all of these are the same",
          complete: Math.random() > 0.5 ? true : false,
          somethingElse: "whatever"
        }))
      )
    ),
    get("/count", (_, res) => send(res, 200, { id: 7, value: count })),
    put("/count", async (req, res) => {
      const body = await json(req);
      const { by } = body;
      count += by;
      send(res, 200, {
        id: 7,
        value: count
      });
    }),
    get("/", () =>
      fs.readFileSync(path.join(__dirname, "build", "index.html"), "utf-8")
    ),
    get("/*", (req, res) => {
      try {
        return fs.readFileSync(path.join(__dirname, "build", req.url), "utf-8");
      } catch (e) {
        console.error(e);
        send(res, 404, "file not found");
      }
    })
  )
);
