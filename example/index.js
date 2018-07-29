const microCors = require("micro-cors");
const { router, get } = require("microrouter");
const { send } = require("micro");
const fs = require("fs");
const path = require("path");

const cors = microCors({ allowMethods: ["GET"] });

module.exports = cors(
  router(
    get("/document/:id", req => {
      return {
        id: req.params.id,
        name: "conor",
        type: "person",
        stuffIdontcareabout: "christophercolumbus"
      };
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
