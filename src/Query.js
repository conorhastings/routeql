import React from "react";
import getData from "./getData";
import { RouteQLContext } from "./Provider";

class Query extends React.Component {
  constructor(props) {
    super(props);
    this.state = { [this.props.name || "data"]: { loading: true } };
  }
  fetchData = getDataArgs => {
    const dataKey = this.props.name || "data";
    const {
      requests,
      deferredRequests,
      deferredRequestInitialValues
    } = getData(getDataArgs);
    deferredRequests.forEach(request =>
      request.then(({ key, data }) => {
        this.setState({
          [dataKey]: Object.assign({}, this.state[dataKey], { [key]: data })
        });
      })
    );
    return Promise.all(requests).then(responses => {
      const data = responses.reduce((allData, { key, data }) => {
        allData[key] = data;
        return allData;
      }, Object.entries(deferredRequestInitialValues).reduce((defaultDeffered, [key, value]) => {
        if (this.state[dataKey] && this.state[dataKey][key] === undefined) {
          defaultDeffered[key] = value;
        }
        return defaultDeffered;
      }, {}));
      this.setState({
        [dataKey]: Object.assign({}, this.state[dataKey], data)
      });
    });
  };
  componentDidMount() {
    const {
      query,
      endpoint,
      requestDataForField,
      resolver,
      pollInterval,
      cachePolicy,
      config,
      name,
      ...props
    } = this.props;
    const dataKey = name || "data";
    if (pollInterval && typeof pollInterval === "number") {
      this.interval = setInterval(
        () =>
          this.fetchData({
            query,
            endpoint,
            requestDataForField,
            resolver,
            config,
            props,
            cachePolicy: "network-only"
          }),
        pollInterval
      );
    }

    this.fetchData({
      query,
      endpoint,
      requestDataForField,
      resolver,
      config,
      cachePolicy: cachePolicy || config.cachePolicy,
      props
    }).then(data =>
      this.setState({
        [dataKey]: Object.assign(
          {},
          this.state[dataKey],
          { loading: false },
          data
        )
      })
    );
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
      requestDataForField,
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
              requestDataForField,
              resolver,
              config,
              props,
              cachePolicy: "network-only"
            }).then(data =>
              this.setState({
                [dataKey]: Object.assign({}, this.state[dataKey], data)
              })
            )
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
