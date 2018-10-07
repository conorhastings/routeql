import React from "react";
import getData from "./getData";
import { RouteQLContext } from "./Provider";

export default function routeql({
  query,
  endpoint,
  getRequestData,
  resolver,
  pollInterval,
  cachePolicy
}) {
  return WrappedComponent => {
    class RouteQL extends React.Component {
      state = { loading: true };

      componentDidMount() {
        const { config, ...props } = this.props;
        if (pollInterval && typeof pollInterval === "number") {
          this.interval = setInterval(
            () =>
              getData({
                query,
                endpoint,
                getRequestData,
                resolver,
                config,
                props,
                cachePolicy: "network-only"
              }).then(data => this.setState(data)),
            pollInterval
          );
        }
        getData({
          query,
          endpoint,
          getRequestData,
          resolver,
          config,
          cachePolicy: cachePolicy || config.cachePolicy,
          props: this.props
        }).then(data => this.setState(Object.assign({ loading: false }, data)));
      }

      componentWillUnmount() {
        if (this.interval) {
          clearInterval(this.interval);
        }
      }

      render() {
        const { config, ...props } = this.props;
        return (
          <WrappedComponent
            {...this.state}
            refetch={() => {
              getData({
                query,
                endpoint,
                getRequestData,
                resolver,
                config,
                props,
                cachePolicy: "network-only"
              }).then(data => this.setState(data));
            }}
          />
        );
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
