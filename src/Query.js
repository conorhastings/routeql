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
      ...other
    } = this.props;

    if (pollInterval && typeof pollInterval === "number") {
      this.interval = setInterval(
        () =>
          getData({
            query,
            props: other,
            apiPrefix,
            getRequestData,
            getDataFromResponseBody
          }).then(data => this.setState(data)),
        pollInterval
      );
    }

    getData({
      query,
      props: other,
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
    return this.props.children(Object.assign({ refetch: getData }, this.state));
  }
}
