import { Stream }          from 'most';
import { ExecutionResult } from 'graphql';

export type GQL = {loc: {source: {body: string}}};

export function isGQL(query: any): query is GQL {
  return query.loc;
}

export interface IQuery {
  query     : string | GQL;
  variables?: object;
}

export interface IMutation extends IQuery { }

export interface IClientOptions {
  url          : string;
  bearer?      : string;
  fetchOptions?: object | (() => object);
}

// Response from executeQuery call
export interface IQueryResponse {
  data?  : any;
  error? : any;
}

export type GraphQLMiddleware = (query: IQuery, request: RequestInit, next: () => void) => void;

export interface IClient {
  bearer?: string;

  executeQuery   (queryObject: IQuery, headers?: object, skipCache?: boolean): Promise<IQueryResponse>;
  query          (query: GQL, variables?: object, headers?: object): Promise<IQueryResponse>;
  use            (middleware: GraphQLMiddleware): void;
  executeMutation(mutationObject: IMutation, headers?: object): Promise<IQueryResponse>;
  mutation       (query: GQL, variables: object, headers?: object): Promise<IQueryResponse>;
  subscribe<T>   (query: GQL, variables?: object): Stream<ExecutionResult<T>>;
}
