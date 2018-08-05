import React from "react";
import getData from "./getData";

export default function routeql({
  query,
  apiPrefix,
  getRequestData,
  getDataFromResponseBody
}) {
  return WrappedComponent =>
    class RouteQL extends React.Component {
      state = { loading: true };

      componentDidMount() {
        getData({
          query,
          props: this.props,
          apiPrefix,
          getRequestData,
          getDataFromResponseBody
        }).then(data => this.setState(Object.assign({ loading: false }, data)));
      }

      render() {
        return <WrappedComponent {...this.state} />;
      }
    };
}
