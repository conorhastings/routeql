import { parse } from "graphql/language/parser";
import routeql from './routeql';
import Query from './Query';

export default routeql;
export { routeql, Query, parse as parseQuery };
