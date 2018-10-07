import React from "react";
import getData from "./getData";
import { RouteQLContext } from "./Provider";

class Query extends React.Component {
  state = { loading: true };

  componentDidMount() {
    const {
      query,
      endpoint,
      getRequestData,
      resolver,
      pollInterval,
      cachePolicy,
      config,
      ...props
    } = this.props;

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
      endpoint,
      getRequestData,
      resolver,
      pollInterval,
      cachePolicy,
      children,
      config,
      ...props
    } = this.props;
    return children(
      Object.assign(
        {
          refetch: () =>
            getData({
              query,
              endpoint,
              getRequestData,
              resolver,
              config,
              props,
              cachePolicy: "network-only"
            }).then(data => this.setState(data))
        },
        this.state
      )
    );
  }
}

export default function ConfigConsumer(props) {
  return (
    <RouteQLContext.Consumer>
      {config => <Query config={config} {...props} />}
    </RouteQLContext.Consumer>
  );
}
