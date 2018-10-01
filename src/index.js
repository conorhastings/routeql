import { parse as parseQuery } from "graphql/language/parser";
import routeql from './routeql';
import Query from './Query';
import { default as RouteQLProvider } from './Provider';

export default RouteQLProvider;
export { routeql, Query, parseQuery, RouteQLProvider };
