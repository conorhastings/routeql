import React from "react";
import { parse } from "graphql/language/parser";
import getData from "./getData";
import { RouteQLContext } from "./Provider";

export default function routeql(
  query,
  { endpoint, requestDataForField, resolver, pollInterval, cachePolicy, name }
) {
  const ast = typeof query === "string" ? parse(query) : query;
  const isMutation =
    ast.definitions[0] && ast.definitions[0].operation === "mutation";
  const dataKey = name || "data";
  return WrappedComponent => {
    class RouteQL extends React.Component {
      state = { [dataKey]: { loading: true } };
      fetchData = getDataArgs => {
        const dataKey = this.props.name || "data";
        const {
          requests,
          deferredRequests,
          deferredRequestInitialValues
        } = getData(getDataArgs);
        deferredRequests.forEach(request =>
          request.then(({ key, data }) => {
            this.setState({
              [dataKey]: Object.assign({}, this.state[dataKey], { [key]: data })
            });
          })
        );
        return Promise.all(requests).then(responses => {
          const data = responses.reduce((allData, { key, data }) => {
            allData[key] = data;
            return allData;
          }, Object.entries(deferredRequestInitialValues).reduce((defaultDeffered, [key, value]) => {
            if (this.state[dataKey] && this.state[dataKey][key] === undefined) {
              defaultDeffered[key] = value;
            }
            return defaultDeffered;
          }, {}));
          this.setState({
            [dataKey]: Object.assign({}, this.state[dataKey], data)
          });
        });
      };
      componentDidMount() {
        const { config, ...props } = this.props;
        if (pollInterval && typeof pollInterval === "number" && !isMutation) {
          this.interval = setInterval(
            () =>
              this.fetchData({
                query: ast,
                endpoint,
                requestDataForField,
                resolver: resolver,
                config,
                props,
                cachePolicy: "network-only"
              }).then(data => {
                this.setState({
                  [dataKey]: Object.assign({}, this.state[dataKey], data)
                });
              }),
            pollInterval
          );
        }
        if (!isMutation) {
          this.fetchData({
            query,
            endpoint,
            requestDataForField,
            resolver,
            config,
            cachePolicy: cachePolicy || config.cachePolicy,
            props: this.props
          }).then(data =>
            this.setState({
              [dataKey]: Object.assign(
                {},
                this.state[dataKey],
                { loading: false },
                data
              )
            })
          );
        }
      }

      componentWillUnmount() {
        if (this.interval) {
          clearInterval(this.interval);
        }
      }

      render() {
        const { config, ...props } = this.props;
        const otherProps = {
          [name && isMutation ? name : isMutation ? "mutate" : "refetch"]: () =>
            this.fetchData({
              query,
              endpoint,
              requestDataForField,
              resolver,
              config,
              props,
              cachePolicy: "network-only"
            }).then(data => {
              if (!isMutation) {
                this.setState({
                  [dataKey]: Object.assign({}, this.state[dataKey], data)
                });
              }
            })
        };
        return <WrappedComponent {...props} {...this.state} {...otherProps} />;
      }
    }
    return function ConfigConsumer(props) {
      return (
        <RouteQLContext.Consumer>
          {config => <RouteQL config={config} {...props} />}
        </RouteQLContext.Consumer>
      );
    };
  };
}
