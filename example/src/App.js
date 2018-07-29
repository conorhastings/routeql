import React, { Component } from "react";
import routeql from "routeql";
import SyntaxHighlighter from 'react-syntax-highlighter/prism';
import atomDark from 'react-syntax-highlighter/styles/prism/atom-dark';

class App extends Component {
  render() {
    return <div style={{ padding: 20 }}>
        <h1>RouteQL Populated Props</h1>
        <ul>
          {Object.entries(this.props).map(([key, value]) => <li key={key}>
              {key}: {value}
            </li>)}
        </ul>
        <h1>Example RouteQL Usage</h1>
        <h2>Client</h2>
        <br />
        <SyntaxHighlighter language="javascript" style={atomDark}>
          {`class App extends Component {
  render() {
    return (
      <div>
        <h1>RouteQL Populated Props</h1>
        <ul>
          {Object.entries(this.props).map(([key, value]) => (
            <li key={key}>
              {key}: {value}
            </li>
          ))}
        </ul>
        <h1>Example RouteQL Usage</h1>
        <br />
      </div>
    );
  }
}

export default routeql({
  query: \`query {
    document {
      id
      name
      type
    }
  }
  \`,
  getRequestData: props => ({params: [1], requestQuery: {} }),
  apiPrefix: "http://localhost:3000"
})(App);
        `}
        </SyntaxHighlighter>
        <h2>Server</h2>
        <SyntaxHighlighter language="javascript" style={atomDark}>
          {`const microCors = require("micro-cors");
const { router, get } = require("microrouter");

const cors = microCors({ allowMethods: ["GET"] });

module.exports = cors(router(
  get("/document/:id", req => {
    return {
      id: req.params.id,
      name: "conor",
      type: "person",
      stuffIdontcareabout: "christophercolumbus"
    };
  })
));
`}
        </SyntaxHighlighter>
      </div>;
  }
}

export default routeql({
  query: `
    query {
      document {
        id
        name
        type
      }
    }
  `,
  getRequestData: props => ({ params: [1], requestQuery: {} }),
})(App);
