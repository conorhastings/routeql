## RouteQL

**note** - this project is in it's early stages and may change API.

RouteQL takes the idea of expressive colocated querying data from the frontend in tools like GraphQL (we even use the graphql query structure and parser) and the idea of a `Query` component or `routeql` higher order component from tools like Apollo and applies them to make these queries backend agnostic. RouteQL transforms queries into route requests, allowing you to use props to determine route and query parameters. 

This allows for the expressiveness of a colocated GraphQL query without the need for any specific backend. This project is still in the very early stages but you can see some code examples below and a live example <a href="https://example.routeql.org">here</a>. You can also read more about the idea behind the project <a href="https://codeburst.io/routeql-graphql-without-the-graphql-e5a9803ab706">here</a>

The arguments to the Higher Order Component are the same as the props to the query Component and can be seen below. In the future I hope to follow the lead of apollow allowing creation of custom network interfaces. 

- *query* - a string query that is parsable by the graphql parser. The top level of each entity (person, post, todos) below will inform the route that the query hits. So
```jsx
query {
  person {
    id
  }
}
```
would hit `/person` and fruther arguments would inform further path considerations. 
- **apiPrefix** - defaults to `""` , use this if you would like each route to have some starting route parameters, an apiPrefix of `/api/v1` with the above query would hit `/api/v1/person`
- **getRequestData** - called once for each each request, returns an object with keys `params` and queryParams. In the above to achieve something like `/person/1` one would use `{ params: [1], queryParams: {} };`
- **getDataFromResponseBody** - optional parameter that is used to transform the response body from the server into an object or array of objects in which each object contains the fields requested (missing fields will be passed as null)
- **pollInterval** - an optional parameter that will cause the component to make requests for new data ever n milliseconds. If you wanted to refresh every 2 seconds you could pass a pollInterval of `2000`
- **cachePolicy** - this project uses the fetch-dedupe package under the hood which handles caching, you can see documentation on options <a href="https://github.com/jamesplease/fetch-dedupe/tree/4.0.0#caching">here</a>. We use the same defaults, with the exception that using pollInterval or refetch will always hit the network.

### Higher Order Component 

```jsx
class App extends Component {
  render() {
    return this.props.loading ? (
      <h1>Loading Data</h1>
    ) : (
      <div style={{ padding: 20 }}>
        <h1>RouteQL Populated Props</h1>
        <h2>Person Query</h2>
        <ul>
          {Object.entries(this.props.person).map(([key, value]) => (
            <li key={key}>
              {key}: {value}
            </li>
          ))}
        </ul>
        <h2>Post Query</h2>
        <ul>
          {Object.entries(this.props.post).map(([key, value]) => (
            <li key={key}>
              {key}: {typeof value === "object" && value !== null
                ? JSON.stringify(value)
                : value}
            </li>
          ))}
        </ul>
        <h2>Todo List Query</h2>
        <ul>
          {this.props.todos.map(todo => <li key={todo.id}>
              <input type="checkbox" disabled checked={todo.complete} /> {todo.todo}
            </li>)}
        </ul>
      );
  }
}

export default routeql({
  query: `
    query {
      person {
        id
        name
        type
      },
      post {
        id
        title
        body
        metadata {
          author
        }
      },
      todos {
        id,
        todo,
        complete
      }
    }
  `,
  getRequestData: ({ props, routeName }) => {
    switch (routeName) {
      case "person": {
        return { params: [1], queryParams: {} };
      }
      case "post": {
        return { params: [2], queryParams: {} };
      }
      default: {
        return { params: [], queryParams: {} };
      }
    }
  }
})(App);
```
### Query Component With function as children

```jsx
function RenderPropQuery() {
  return (
    <Query
      query={`query {
              person {
            id
            name
            type
          },
          post {
              id
            title
            body
            metadata {
              author
            }
            },
          todos {
              id,
            todo,
            complete
          }
        }
      `}
      apiPrefix="http://localhost:3000"
      getRequestData={({ props, routeName }) => {
              switch (routeName) {
                case "person": {
                  return { params: [1], queryParams: {} };
                }
                case "post": {
                  return { params: [2], queryParams: {} };
                }
                default: {
                  return { params: [], queryParams: {} };
                }
              }
            }}
    >
      {({ loading, person, post, todos }) =>
              loading ? (
                <h1>Loading Data</h1>
              ) : (
                  <Fragment>
                    <h1>RouteQL Populated Props</h1>
                    <h2>Person Query</h2>
                    <ul>
                      {Object.entries(person).map(([key, value]) => (
                        <li key={key}>
                          {key}: {value}
                        </li>
                      ))}
                    </ul>
                    <h2>Post Query</h2>
                    <ul>
                      {Object.entries(post).map(([key, value]) => (
                        <li key={key}>
                          {key}:{" "}
                          {typeof value === "object" && value !== null
                            ? JSON.stringify(value)
                            : value}
                        </li>
                      ))}
                    </ul>
                    <h2>Todo List Query</h2>
                    <ul>
                      {todos.map(todo => (
                        <li key={todo.id}>
                          <input type="checkbox" disabled checked={todo.complete} />{" "}
                          {todo.todo}
                        </li>
                      ))}
                    </ul>
                  </Fragment>
                )
            }
    </Query>
  );
}
```