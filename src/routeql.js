import React from "react";
import getData from "./getData";

export default function routeql({
  query,
  apiPrefix,
  getRequestData,
  getDataFromResponseBody,
  pollInterval,
  cachePolicy
}) {
  return WrappedComponent =>
    class RouteQL extends React.Component {
      state = { loading: true };

      componentDidMount() {
        if (pollInterval && typeof pollInterval === "number") {
          this.interval = setInterval(
            () =>
              getData({
                query,
                apiPrefix,
                getRequestData,
                getDataFromResponseBody,
                props: this.props,
                cachePolicy: "network-only"
              }).then(data => this.setState(data)),
            pollInterval
          );
        }
        getData({
          query,
          apiPrefix,
          getRequestData,
          getDataFromResponseBody,
          cachePolicy,
          props: this.props
        }).then(data => this.setState(Object.assign({ loading: false }, data)));
      }

      componentWillUnmount() {
        if (this.interval) {
          clearInterval(this.interval);
        }
      }

      render() {
        return (
          <WrappedComponent
            {...this.state}
            refetch={() => {
              getData({
                query,
                apiPrefix,
                getRequestData,
                getDataFromResponseBody,
                props: this.props,
                cachePolicy: "network-only"
              }).then(data => this.setState(data))
            }}
          />
        );
      }
    };
}
