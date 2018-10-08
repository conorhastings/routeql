import React from "react";
import PropTypes from "prop-types";

export const RouteQLContext = React.createContext({});

export default class Provider extends React.Component {
  static propTypes = {
    config: PropTypes.shape({
      defaultEndpoint: PropTypes.string,
      headers: PropTypes.object,
      fetch: PropTypes.function,
      fetchOptions: PropTypes.object,
      credentials: PropTypes.string,
      cachePolicy: PropTypes.string
    }).isRequired,
    children: PropTypes.node.isRequired
  };

  render() {
    return (
      <RouteQLContext.Provider value={this.props.config}>
        {this.props.children}
      </RouteQLContext.Provider>
    );
  }
}
