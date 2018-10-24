import { parse } from "graphql/language/parser";
import { fetchDedupe } from "fetch-dedupe";

function getDefaultRequestData(field) {
  return { params: [field], queryParams: {} };
}

function getParamString(params) {
  return params.reduce((acc, param) => `${acc}/${param}`, "");
}

function getQueryString(queryParams) {
  return Object.entries(queryParams).reduce(
    (qs, [key, value]) => `${qs}${qs.length === 1 ? "" : "&"}${key}=${value}`,
    "?"
  );
}

function pickSelectionsFromData({ data, selections }) {
  return selections.reduce((queriedData, selection) => {
    const field = selection.name.value;
    if (selection.selectionSet) {
      queriedData[field] = pickSelectionsFromData({
        data: data[field] || {},
        selections: selection.selectionSet.selections
      });
    } else {
      queriedData[field] = data[field] === undefined ? null : data[field];
    }
    return queriedData;
  }, {});
}

export default function getData({
  config = {},
  query = "",
  requestDataForField = {},
  resolver = config.defaultResolver || {},
  endpoint = config.defaultEndpoint || "",
  props,
  cachePolicy = "cache-first"
}) {
  const ast = typeof query === "string" ? parse(query) : query;
  if (ast.definitions.length !== 1) {
    throw new Error(
      "RouteQL currently only supports one query at a time, split up calls to Query or the routeql HOC or request data in one query"
    );
  }
  const def = ast.definitions[0];
  const selections = def.selectionSet.selections;
  const requests = selections.map(route => {
    const field = route.name.value;
    const selections = route.selectionSet.selections;
    const {
      method = def.operation === "query" ? "GET" : "POST",
      params = {},
      queryParams = {},
      body
    } = (requestDataForField[field] || (() => getDefaultRequestData(field)))({
      field,
      selections,
      props
    });
    const paramString = getParamString(params);
    const queryString = getQueryString(queryParams);
    return (config.fetch || fetchDedupe)(
      `${endpoint}${paramString}${queryString}`,
      Object.assign(
        { method, body: body ? JSON.stringify(body) : undefined },
        config.fetchOptions || {}
      ),
      {
        cachePolicy
      }
    )
      .then(
        res =>
          resolver[field] ? resolver[field]({ data: res.data }) : res.data
      )
      .then(data => ({
        key: field,
        data: Array.isArray(data)
          ? data.map(item => pickSelectionsFromData({ data: item, selections }))
          : pickSelectionsFromData({ data, selections })
      }));
  });
  return Promise.all(requests).then(responses =>
    responses.reduce((allData, { key, data }) => {
      allData[key] = data;
      return allData;
    }, {})
  );
}
