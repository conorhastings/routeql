import React from "react";
import getData from "./getData";

export default function routeql({
  query,
  apiPrefix,
  getRequestData,
  getDataFromResponseBody,
  pollInterval
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
                props: this.props,
                apiPrefix,
                getRequestData,
                getDataFromResponseBody
              }).then(data => this.setState(data)),
            pollInterval
          );
        }
        getData({
          query,
          props: this.props,
          apiPrefix,
          getRequestData,
          getDataFromResponseBody
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
                props: this.props,
                apiPrefix,
                getRequestData,
                getDataFromResponseBody
              }).then(data => this.setState(data))
            }}
          />
        );
      }
    };
}
