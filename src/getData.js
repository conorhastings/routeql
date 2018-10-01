import { parse } from "graphql/language/parser";
import { fetchDedupe } from "fetch-dedupe";

function getParamString(params) {
  return params.reduce((acc, param) => `${acc}/${param}`, "");
}

function getQueryString(queryParams) {
  return Object.entries(queryParams).reduce(
    (qs, [key, value]) => `${qs}${qs.length === 1 ? "" : "&"}${key}=${value}`,
    "?"
  );
}

function pickFieldsFromData({ data, fields }) {
  return fields.reduce((queriedData, field) => {
    const fieldName = field.name.value;
    if (field.selectionSet) {
      queriedData[fieldName] = pickFieldsFromData({
        data: data[fieldName] || {},
        fields: field.selectionSet.selections
      });
    } else {
      queriedData[fieldName] = data[fieldName] || null;
    }
    return queriedData;
  }, {});
}

export default function getData({
  query = "",
  apiPrefix = "",
  getRequestData = () => ({ params: [], queryParams: {} }),
  getDataFromResponseBody = body => body || {},
  config,
  props,
  cachePolicy = "cache-first"
}) {
  const ast = typeof query === "string" ? parse(query) : query;
  if (ast.definitions !== 1) {
    throw new error(
      "RouteQL currently only supports one query at a time, split up calls to Query or the routeql HOC or request data in one query"
    );
  }
  const def = ast.definitions[0];
  const selections = def.selectionSet.selections;
  const requests = selections.map(route => {
    const routeName = route.name.value;
    const fields = route.selectionSet.selections;
    const { params, queryParams, method } = getRequestData({
      routeName,
      fields,
      props
    });
    const paramString = getParamString(params);
    const queryString = getQueryString(queryParams);
    const reqType = method || def.operation === "query" ? "GET" : "POST";
    return (config.fetch || fetchDedupe)(
      `${apiPrefix || config.apiPrefix}/${routeName}${paramString}${queryString}`,
      Object.assign((fetchOptions || {}), {
        method: reqType || config.fetchOptions && config.fetchOptions.method,
        headers: new Headers(config.headers || {}),
        credentials: config.credentials
      },
      { cachePolicy }
    ))
      .then(res => getDataFromResponseBody(res.data))
      .then(data => ({
        key: routeName,
        data: Array.isArray(data)
          ? data.map(item => pickFieldsFromData({ data: item, fields }))
          : pickFieldsFromData({ data, fields })
      }));
  });
  return Promise.all(requests).then(responses =>
    responses.reduce((allData, { key, data }) => {
      allData[key] = data;
      return allData;
    }, {})
  );
}
