## RouteQL

RouteQL takes the idea of expressive colocated querying data from the frontend in tools like GraphQL (we even use the graphql query structure and parser) and the idea of a `Query` component or `routeql` higher order component from tools like Apollo and applies them to make these queries backend agnostic. RouteQL transforms queries into route requests, allowing you to use props to determine route and query parameters. 

This allows for the expressiveness of a colocated GraphQL query without the need for any specific backend. This project is still in the very early stages but you can see some code examples below and a live example <a href="https://example-oazvodugup.now.sh/">here</a>. You can also read more about the idea behind the project <a href="https://codeburst.io/routeql-graphql-without-the-graphql-e5a9803ab706">here</a>

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