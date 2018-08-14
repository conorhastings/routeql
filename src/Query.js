import React from "react";
import getData from "./getData";

export default class Query extends React.Component {
  state = { loading: true };

  componentDidMount() {
    const {
      query,
      apiPrefix,
      getRequestData,
      getDataFromResponseBody,
      pollInterval,
      cachePolicy,
      ...props
    } = this.props;

    if (pollInterval && typeof pollInterval === "number") {
      this.interval = setInterval(
        () =>
          getData({
            query,
            apiPrefix,
            getRequestData,
            getDataFromResponseBody,
            props,
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
      props
    }).then(data => this.setState(Object.assign({ loading: false }, data)));
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  render() {
    const {
      query,
      apiPrefix,
      getRequestData,
      getDataFromResponseBody,
      pollInterval,
      cachePolicy,
      children,
      ...props
    } = this.props;
    return children(
      Object.assign(
        {
          refetch: () =>
            getData({
              query,
              apiPrefix,
              getRequestData,
              getDataFromResponseBody,
              props,
              cachePolicy: "network-only"
            }).then(data => this.setState(data))
        },
        this.state
      )
    );
  }
}
