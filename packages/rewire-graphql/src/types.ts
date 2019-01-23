export interface ICache {
  write        (queryId: string | undefined, data: any): any;
  read         (queryId: string): any;
  invalidate   (queryId: string): void;
  invalidateAll(): void;
}

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
  fetchOptions?: object | (() => object);
  cache?       : ICache;
}

// Response from executeQuery call
export interface IQueryResponse {
  queryId: string;
  data?  : any;
}

export interface IClient {
  cache: ICache;

  executeQuery   (queryObject: IQuery, headers?: object, skipCache?: boolean): Promise<IQueryResponse>;
  query          (query: GQL, variables?: object, headers?: object): Promise<IQueryResponse>;
  executeMutation(mutationObject: IMutation, headers?: object): Promise<IQueryResponse>;
  mutation       (query: GQL, variables: object, headers?: object): Promise<IQueryResponse>;
}
