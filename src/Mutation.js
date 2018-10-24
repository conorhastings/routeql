import React from "react";
import getData from "./getData";
import { RouteQLContext } from "./Provider";

class Mutation extends React.Component {
  render() {
    const {
      mutation,
      endpoint,
      requestDataForField,
      children,
      config,
      ...props
    } = this.props;
    return children(() => {
      getData({
        query: mutation,
        endpoint,
        requestDataForField,
        config,
        props,
        cachePolicy: "network-only"
      })}
    );
  }
}

export default function ConfigConsumer(props) {
  return (
    <RouteQLContext.Consumer>
      {config => <Mutation config={config} {...props} />}
    </RouteQLContext.Consumer>
  );
}
