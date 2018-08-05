import { parse } from "graphql/language/parser";

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
  props,
  query = "",
  apiPrefix = "",
  getRequestData = () => ({ params: [], queryParams: {} }),
  getDataFromResponseBody = body => body || {}
}) {
  const ast = parse(query);
  const def = ast.definitions[0];
  const selections = def.selectionSet.selections;
  const requests = selections.map(route => {
    const routeName = route.name.value;
    const fields = route.selectionSet.selections;
    const { params, queryParams, method } = getRequestData({
      props: props,
      routeName,
      fields
    });
    const paramString = getParamString(params);
    const queryString = getQueryString(queryParams);
    const reqType = method || def.operation === "query" ? "GET" : "POST";
    return fetch(`${apiPrefix}/${routeName}${paramString}${queryString}`, {
      method: reqType
    })
      .then(res => res.json())
      .then(body => getDataFromResponseBody(body))
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
