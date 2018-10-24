import { parse as parseQuery } from "graphql/language/parser";
import routeql from './routeql';
import Query from './Query';
import Mutation from './Mutation'
import { default as RouteQLProvider, RouteQLContext } from './Provider';


export { routeql, Query, parseQuery, RouteQLProvider, RouteQLContext, Mutation };
