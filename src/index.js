import gql from "graphql-tag";
import React from "react";

export default function routeql({
  query = "",
  getRequestData = () => ({ params: [], requestQuery: {} }),
  apiPrefix = "",
  getDataFromResponseBody = body => body || {}
}) {
  const ast = gql`
    ${query}
  `;
  const def = ast.definitions[0];
  const route = def.selectionSet.selections[0];
  const routeName = route.name.value;
  const fields = route.selectionSet.selections.map(field => field.name.value);
  return WrappedComponent =>
    class RouteQL extends React.Component {
      getData = () => {
        const { params, requestQuery, method } = getRequestData(this.props);
        const paramString = params.reduce(
          (acc, param) => `${acc}/${param}`,
          ""
        );
        const queryString = Object.entries(requestQuery).reduce(
          (qs, [key, value]) =>
            `${qs}${qs.length === 1 ? "" : "&"}${key}=${value}`,
          "?"
        );
        const reqType = method || def.operation === "query" ? "GET" : "POST";
        return fetch(`${apiPrefix}/${routeName}${paramString}${queryString}`, {
          method: reqType
        })
          .then(res => res.json())
          .then(body => getDataFromResponseBody(body))
          .then(data =>
            fields.reduce((queriedData, field) => {
              queriedData[field] = data[field] || null;
              return queriedData;
            }, {})
          );
      };
      componentDidMount() {
        this.getData().then(data => this.setState(data));
      }
      render() {
        return <WrappedComponent {...this.state} />;
      }
    };
}
