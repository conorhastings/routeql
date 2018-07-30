import React, { Component } from "react";
import routeql from "routeql";
import SyntaxHighlighter from "react-syntax-highlighter/prism";
import atomDark from "react-syntax-highlighter/styles/prism/atom-dark";

class App extends Component {
  render() {
    return this.props.loading ? <h1>
        Loading Data
      </h1> : <div style={{ padding: 20 }}>
        <h1>RouteQL Populated Props</h1>
        <h2>Person Query</h2>
        <ul>
          {Object.entries(this.props.person).map(([key, value]) => (
            <li key={key}>
              {key}: {value}
            </li>
          ))}
        </ul>
        <h2>Post Query</h2>
        <ul>
          {Object.entries(this.props.post).map(([key, value]) => (
            <li key={key}>
              {key}: {value}
            </li>
          ))}
        </ul>
        <h2>Todo List Query</h2>
        <ul>
          {this.props.todos.map(todo => <li key={todo.id}>
              <input type="checkbox" disabled checked={todo.complete} /> {todo.todo}
            </li>)}
        </ul>
        <h1>Example RouteQL Usage</h1>
        <h2>Client</h2>
        <br />
        <SyntaxHighlighter language="jsx" style={atomDark}>
          {`class App extends Component {
  render() {
    return this.props.loading ? (
      <h1>Loading Data</h1>
    ) : (
      <div style={{ padding: 20 }}>
        <h1>RouteQL Populated Props</h1>
        <h2>Person Query</h2>
        <ul>
          {Object.entries(this.props.person).map(([key, value]) => (
            <li key={key}>
              {key}: {value}
            </li>
          ))}
        </ul>
        <h2>Post Query</h2>
        <ul>
          {Object.entries(this.props.post).map(([key, value]) => (
            <li key={key}>
              {key}: {value}
            </li>
          ))}
        </ul>
        <h2>Todo List Query</h2>
        <ul>
          {this.props.todos.map(todo => <li key={todo.id}>
              <input type="checkbox" disabled checked={todo.complete} /> {todo.todo}
            </li>)}
        </ul>
      );
  }
}

export default routeql({
  query: \`
    query {
      person {
        id
        name
        type
      },
      post {
        id
        title
        body
      },
      todos {
        id,
        todo,
        complete
      }
    }
  \`,
  getRequestData: ({ props, routeName }) => {
    switch (routeName) {
      case "person": {
        return { params: [1], queryParams: {} };
      }
      case "post": {
        return { params: [2], queryParams: {} };
      }
      default: {
        return { params: [], queryParams: {} };
      }
    }
  },
  apiPrefix: "http://localhost:3000"
})(App);


        `}
        </SyntaxHighlighter>
        <h2>Server</h2>
        <SyntaxHighlighter language="javascript" style={atomDark}>
          {`const microCors = require("micro-cors");
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
`}
        </SyntaxHighlighter>
        <h2>
          <a href="https://github.com/conorhastings/routeql">
            Code on Github
          </a>
        </h2>
      </div>;
  }
}

export default routeql({
  query: `
    query {
      person {
        id
        name
        type
      },
      post {
        id
        title
        body
      },
      todos {
        id,
        todo,
        complete
      }
    }
  `,
  getRequestData: ({ props, routeName }) => {
    switch (routeName) {
      case "person": {
        return { params: [1], queryParams: {} };
      }
      case "post": {
        return { params: [2], queryParams: {} };
      }
      default: {
        return { params: [], queryParams: {} };
      }
    }
  },
  apiPrefix: "http://localhost:3000"
})(App);
