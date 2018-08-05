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
      ...other
    } = this.props;

    getData({
      query,
      props: other,
      apiPrefix,
      getRequestData,
      getDataFromResponseBody
    }).then(data => this.setState(Object.assign({ loading: false }, data)));
  }

  render() {
    return this.props.children(this.state);
  }
}
