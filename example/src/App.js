import React, { Component, Fragment } from "react";
import { routeql, Query, RouteQLProvider } from "routeql";
import SyntaxHighlighter from "react-syntax-highlighter/prism";
import atomDark from "react-syntax-highlighter/styles/prism/atom-dark";

const routeqlConfig = {
  defaultEndpoint: "http://localhost:3000"
};

function ProviderConfigUsage() {
  return (
    <RouteQLProvider config={routeqlConfig}>
      <Fragment>
        <Query
          query={`query {
          person {
            id
          }
        }`}
          requestDataForField={{
            person() {
              return { params: ["person", 1] };
            }
          }}
          name={"person"}
        >
          {({ person: { person: { id } = {}, loading } }) =>
            loading ? (
              <h1>Loading Using Provider</h1>
            ) : (
              <Fragment>
                <h1>Person ID Query</h1>
                <ul>
                  <li>person id: {id}</li>
                </ul>
              </Fragment>
            )
          }
        </Query>
        <Query
          query={`query {
          post {
            id
          }
        }`}
          requestDataForField={{
            post() {
              return { params: ["post", 2] };
            }
          }}
        >
          {({ data: { post: { id } = {}, loading } }) =>
            loading ? (
              <h1>Loading Using Provider</h1>
            ) : (
              <Fragment>
                <h1>POST ID Query</h1>
                <ul>
                  <li>post id: {id}</li>
                </ul>
              </Fragment>
            )
          }
        </Query>
      </Fragment>
    </RouteQLProvider>
  );
}

function RenderPropQuery() {
  return (
    <Query
      endpoint="http://localhost:3000"
      query={`query {
          person {
            id
            name
            type
          },
          post {
            id
            title
            body
            metadata {
              author
            }
          },
          todos {
            id,
            todo,
            complete
          }
        }
      `}
      requestDataForField={{
        person() {
          return { params: ["person", 1] };
        },
        post() {
          return { params: ["post", 2] };
        }
      }}
      resolver={{
        person({ data }) {
          return Object.assign({}, data, { name: data.personName });
        }
      }}
    >
      {({ data: { loading, person, post, todos } }) =>
        loading ? (
          <h1>Loading Data</h1>
        ) : (
          <Fragment>
            <h1>RouteQL Populated Props</h1>
            <h2>Person Query</h2>
            <ul>
              {Object.entries(person).map(([key, value]) => (
                <li key={key}>
                  {key}: {value}
                </li>
              ))}
            </ul>
            <h2>Post Query</h2>
            <ul>
              {Object.entries(post).map(([key, value]) => (
                <li key={key}>
                  {key}:{" "}
                  {typeof value === "object" && value !== null
                    ? JSON.stringify(value)
                    : value}
                </li>
              ))}
            </ul>
            <h2>Todo List Query</h2>
            <ul>
              {todos.map(todo => (
                <li key={todo.id}>
                  <input type="checkbox" disabled checked={todo.complete} />{" "}
                  {todo.todo}
                </li>
              ))}
            </ul>
          </Fragment>
        )
      }
    </Query>
  );
}

class App extends Component {
  render() {
    const { loading, person, post, todos } = this.props.data; 
    return loading ? (
      <h1>Loading Data</h1>
    ) : (
      <div style={{ padding: 20 }}>
        <h1>Higher Order Component</h1>
        <h1>RouteQL Populated Props</h1>
        <h2>Person Query</h2>
        <ul>
          {Object.entries(person).map(([key, value]) => (
            <li key={key}>
              {key}: {value}
            </li>
          ))}
        </ul>
        <h2>Post Query</h2>
        <ul>
          {Object.entries(post).map(([key, value]) => (
            <li key={key}>
              {key}:{" "}
              {typeof value === "object" && value !== null
                ? JSON.stringify(value)
                : value}
            </li>
          ))}
        </ul>
        <h2>Todo List Query</h2>
        <ul>
          {todos.map(todo => (
            <li key={todo.id}>
              <input type="checkbox" disabled checked={todo.complete} />{" "}
              {todo.todo}
            </li>
          ))}
        </ul>
        <h1>Using Render Prop with Query Component</h1>
        <RenderPropQuery />
        <h1>Using Config Set By Provider</h1>
        <ProviderConfigUsage />
        <h1>Example RouteQL Usage</h1>
        <h2>Client -- Higher Order Component (Mutation and Query)</h2>
        <SyntaxHighlighter language="jsx" style={atomDark}>
            {`class App extends Component {
  render() {
    const { loading, person, post, todos } = this.props;
    return loading ? (
      <h1>Loading Data</h1>
    ) : (
      <div style={{ padding: 20 }}>
        <h1>RouteQL Populated Props</h1>
        <h2>Person Query</h2>
        <ul>
          {Object.entries(person).map(([key, value]) => (
            <li key={key}>
              {key}: {value}
            </li>
          ))}
        </ul>
        <h2>Post Query</h2>
        <ul>
          {Object.entries(post).map(([key, value]) => (
            <li key={key}>
              {key}: {typeof value === "object" && value !== null
                ? JSON.stringify(value)
                : value}
            </li>
          ))}
        </ul>
        <h2>Todo List Query</h2>
        <ul>
          {todos.map(todo => <li key={todo.id}>
              <input type="checkbox" disabled checked={todo.complete} /> {todo.todo}
            </li>)}
        </ul>
      </div>
    );
  }
}

export default routeql(
  \`mutation {
    count {
      value
    }
  }\`,
  {
    endpoint: "http://localhost:3000",
    requestDataForField: {
      count() {
        return { params: ["count"], method: "PUT", body: { by: 2 } };
      }
    },
    name: "incrementCount"
  }
)(routeql(
  \`query {
      person {
        id
        name
        type
      },
      post {
        id
        title
        body
        metadata {
          author
        }
      },
      todos {
        id,
        todo,
        complete
      },
      count {
        value
      }
    }
  \`,
  {
    endpoint: "http://localhost:3000",
    requestDataForField: {
      person() {
        return { params: ["person", 1] };
      },
      post() {
        return { params: ["post", 2] };
      },
      count() {
        return { params: ["count"] };
      }
    },
    resolver: {
      person({ data }) {
        return Object.assign({}, data, { name: data.personName });
      }
    }
  }
)(App));`}
        </SyntaxHighlighter>
        <h2>Client -- Query Component with render prop</h2>
        <SyntaxHighlighter language="jsx" style={atomDark}>
          {`function RenderPropQuery() {
  return (
    <Query
      endpoint="http://localhost:3000"
      query={\`query {
          person {
            id
            name
            type
          },
          post {
            id
            title
            body
            metadata {
              author
            }
          },
          todos {
            id,
            todo,
            complete
          }
        }
      \`}
      requestDataForField={{
        person() {
          return { params: ["person", 1] };
        },
        post() {
          return { params: ["post", 2] };
        }
      }}
      resolver={{
        person({ data }) {
          return Object.assign({}, data, { name: data.personName });
        }
      }}
    >
      {({ data: { loading, person, post, todos } }) =>
        loading ? (
          <h1>Loading Data</h1>
        ) : (
          <Fragment>
            <h1>RouteQL Populated Props</h1>
            <h2>Person Query</h2>
            <ul>
              {Object.entries(person).map(([key, value]) => (
                <li key={key}>
                  {key}: {value}
                </li>
              ))}
            </ul>
            <h2>Post Query</h2>
            <ul>
              {Object.entries(post).map(([key, value]) => (
                <li key={key}>
                  {key}:{" "}
                  {typeof value === "object" && value !== null
                    ? JSON.stringify(value)
                    : value}
                </li>
              ))}
            </ul>
            <h2>Todo List Query</h2>
            <ul>
              {todos.map(todo => (
                <li key={todo.id}>
                  <input type="checkbox" disabled checked={todo.complete} />{" "}
                  {todo.todo}
                </li>
              ))}
            </ul>
          </Fragment>
        )
      }
    </Query>
  );
}`}
        </SyntaxHighlighter>
        <h2>
          Client -- Setting Config with Provider instead of having to pass
          individually to each Query Component / routeql HOC
        </h2>
        <SyntaxHighlighter language="jsx" style={atomDark}>
          {`const routeqlConfig = {
  defaultEndpoint: "http://localhost:3000"
};

function ProviderConfigUsage() {
  return (
    <RouteQLProvider config={routeqlConfig}>
      <Fragment>
        <Query
          query={query {
          person {
            id
          }
        }\`}
          requestDataForField={{
            person() {
              return { params: ["person", 1] };
            }
          }}
          name={"person"}
        >
          {({ person: { person: { id } = {}, loading } }) =>
            loading ? (
              <h1>Loading Using Provider</h1>
            ) : (
              <Fragment>
                <h1>Person ID Query</h1>
                <ul>
                  <li>person id: {id}</li>
                </ul>
              </Fragment>
            )
          }
        </Query>
        <Query
          query={\`query {
          post {
            id
          }
        }\`}
          requestDataForField={{
            post() {
              return { params: ["post", 2] };
            }
          }}
        >
          {({ data: { post: { id } = {}, loading } }) =>
            loading ? (
              <h1>Loading Using Provider</h1>
            ) : (
              <Fragment>
                <h1>POST ID Query</h1>
                <ul>
                  <li>post id: {id}</li>
                </ul>
              </Fragment>
            )
          }
        </Query>
      </Fragment>
    </RouteQLProvider>
  );
}`}
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
          <a href="https://github.com/conorhastings/routeql">Code on Github</a>
        </h2>
      </div>
    );
  }
}

export default routeql(
  `mutation {
    count {
      value
    }
  }`,
  {
    endpoint: "http://localhost:3000",
    requestDataForField: {
      count() {
        return { params: ["count"], method: "PUT", body: { by: 2 } };
      }
    },
    name: "incrementCount"
  }
)(routeql(
  `query {
      person {
        id
        name
        type
      },
      post {
        id
        title
        body
        metadata {
          author
        }
      },
      todos {
        id,
        todo,
        complete
      },
      count {
        value
      }
    }
  `,
  {
    endpoint: "http://localhost:3000",
    requestDataForField: {
      person() {
        return { params: ["person", 1] };
      },
      post() {
        return { params: ["post", 2] };
      },
      count() {
        return { params: ["count"] };
      }
    },
    resolver: {
      person({ data }) {
        return Object.assign({}, data, { name: data.personName });
      }
    }
  }
)(App));
