import gql from "graphql-tag";
import React from "react";

export default function routeql({
  query = "",
  getRequestData = () => ({ params: [], queryParams: {} }),
  apiPrefix = "",
  getDataFromResponseBody = body => body || {}
}) {
  const ast = gql`
    ${query}
  `;
  return WrappedComponent =>
    class RouteQL extends React.Component {
      state = { loading: true };

      pickFieldsFromData = ({ data, fields }) => {
        return fields.reduce((queriedData, field) => {
          const fieldName = field.name.value;
          if (field.selectionSet) {
            queriedData[fieldName] = this.pickFieldsFromData({
              data: data[fieldName] || {},
              fields: field.selectionSet.selections
            });
          } else {
            queriedData[fieldName] = data[fieldName] || null;
          }
          return queriedData;
        }, {});
      };

      getData = () => {
        const def = ast.definitions[0];
        const selections = def.selectionSet.selections;
        const requests = selections.map(route => {
          const routeName = route.name.value;
          const fields = route.selectionSet.selections;
          const { params, queryParams, method } = getRequestData({
            props: this.props,
            routeName
          });
          const paramString = params.reduce(
            (acc, param) => `${acc}/${param}`,
            ""
          );
          const queryString = Object.entries(queryParams).reduce(
            (qs, [key, value]) =>
              `${qs}${qs.length === 1 ? "" : "&"}${key}=${value}`,
            "?"
          );
          const reqType = method || def.operation === "query" ? "GET" : "POST";
          return fetch(
            `${apiPrefix}/${routeName}${paramString}${queryString}`,
            {
              method: reqType
            }
          )
            .then(res => res.json())
            .then(body => getDataFromResponseBody(body))
            .then(data => ({
              key: routeName,
              data: Array.isArray(data)
                ? data.map(item =>
                    this.pickFieldsFromData({ data: item, fields })
                  )
                : this.pickFieldsFromData({ data, fields })
            }));
        });
        return Promise.all(requests).then(responses =>
          responses.reduce((allData, { key, data }) => {
            allData[key] = data;
            return allData;
          }, {})
        );
      };
      componentDidMount() {
        this.getData().then(data =>
          this.setState(Object.assign({ loading: false }, data))
        );
      }
      render() {
        return <WrappedComponent {...this.state} />;
      }
    };
}
