import React, { Component, Fragment } from "react";
import { routeql, Query, Mutation, RouteQLProvider } from "routeql";
import SyntaxHighlighter from "react-syntax-highlighter/prism";
import atomDark from "react-syntax-highlighter/styles/prism/atom-dark";
import { createQuery } from "blade.macro";

const personQuery = createQuery();
function Blade() {
  return (
    <Query
      endpoint="http://localhost:3000"
      query={personQuery}
      requestDataForField={{
        person() {
          return { params: ["person", 1] };
        }
      }}
    >
      {({ data }) => {
        if (data.loading) {
          return <h1>Loading Data</h1>;
        } else {
          const DATA = personQuery(data);
          return (
            <Fragment>
              <h2>RouteQL/Blade Populated Props via generated Person Query</h2>

              <ul>
                <li key="name">person name: {DATA.person.personName}</li>
                <li key="type">person type: {DATA.person.type}</li>
              </ul>
            </Fragment>
          );
        }
      }}
    </Query>
  );
}

export default class App extends Component {
  render() {
    return (
      <div>
        <Blade />
        <SyntaxHighlighter language="jsx" style={atomDark}>
          {`const personQuery = createQuery();
function Blade() {
  return (
    <Query
      query={personQuery}
      requestDataForField={{
        person() {
          return { params: ["person", 1] };
        }
      }}
    >
      {({ data }) => {
        if (data.loading) {
          return <h1>Loading Data</h1>;
        } else {
          const DATA = personQuery(data);
          return (
            <Fragment>
              <h1>RouteQL/Blade Populated Props</h1>
              <h2>Person Query</h2>
              <ul>
                <li key="name">person name: {DATA.person.personName}</li>
                <li key="type">person type: {DATA.person.type}</li>
              </ul>
            </Fragment>
          );
        }
      }}
    </Query>
  );
}`}
        </SyntaxHighlighter>
      </div>
    );
  }
}
