import {
  IClientOptions,
  IMutation,
  IQuery,
  IQueryResponse,
  IClient,
  isGQL,
  GraphQLMiddleware,
  GQL
}                             from './types';
import { BSON }               from './bson';
import { nullToUndefined }    from 'rewire-common';
import { hashString }         from './hash';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { from, Stream }       from 'most';
import { extractFiles }       from 'extract-files';
import { ExecutionResult }    from 'graphql';

class Client implements IClient {
  url                : string; // Graphql API URL
  bearer?            : string; // bearer token
  fetchOptions       : object | (() => object); // Options for fetch call
  running            : {[idx: string]: Promise<IQueryResponse>} = {};
  subscriptionClient?: SubscriptionClient;
  middleware         : GraphQLMiddleware[];

  constructor(opts?: IClientOptions) {
    if (!opts) {
      throw new Error('Please provide configuration object');
    }
    // Set option/internal defaults
    if (!opts.url) {
      throw new Error('Please provide a URL for your GraphQL API');
    }

    this.bearer       = opts.bearer;
    this.url          = opts.url;
    this.fetchOptions = opts.fetchOptions || {};
  }

  use(middleware: GraphQLMiddleware) {
    if (!this.middleware) this.middleware = [];
    this.middleware.push(middleware);
  }

  executeQuery(queryObject: IQuery, headers?: object, mutate: boolean = false): Promise<IQueryResponse> {
    const body    = BSON.stringify({query: (isGQL(queryObject.query)) ? queryObject.query.loc.source.body : queryObject.query, variables: queryObject.variables});
    const queryId = hashString(body);

    if (!mutate) {
      let running = this.running[queryId];
      if (running) {
        return running;
      }
    }

    const promise = this.running[queryId] = new Promise<IQueryResponse>(async (resolve, reject) => {
      const fetchOptions =
      typeof this.fetchOptions === 'function'
        ? this.fetchOptions()
        : this.fetchOptions;

      try {
        let reqInit = {
          body: body,
          headers: {
            'content-type': 'application/json',
            ...headers
          },
          method: 'POST',
          ...fetchOptions,
        };

        if (this.middleware && this.middleware.length > 0) {
          let i = 0;
          const next = () => {
            const fn = this.middleware[i++];
            if (!fn) return;
            fn(queryObject, reqInit, next);
          };
          next();
        }

        if (this.bearer) reqInit.headers.Authorization = 'Bearer ' + this.bearer;
        let res      = await fetch(this.url, reqInit);
        let response = BSON.parse(await res.text());
        if (res.ok && !response.errors) {
          resolve({data: response.data});
        } else {
          reject(response);
        }
      } catch (err) {
        reject(err);
      }
      delete this.running[queryId];
    });

    return promise;
  }

  subscribe<T>(query: GQL, variables?: object): Stream<ExecutionResult<T>> {
    if (!this.subscriptionClient) {
      const url = new URL(this.url);
      this.subscriptionClient = new SubscriptionClient(`ws://${url.host}/subscriptions`, {reconnect: true, lazy: true});
    }

    return from(this.subscriptionClient!.request(
      {query: (isGQL(query)) ? query.loc.source.body : query, variables}
    )) as Stream<ExecutionResult<T>>;
  }

  query(query: GQL, variables?: object, headers?: object, mutate: boolean = false): Promise<IQueryResponse> {
    return this.executeQuery({query, variables}, headers, mutate);
  }

  mutation(query: GQL, variables: object, headers?: object): Promise<IQueryResponse> {
    return this.query(query, variables, headers, true);
  }

  executeMutation(mutationObject: IMutation, headers?: object): Promise<IQueryResponse> {
    return this.executeQuery(mutationObject, headers, true);
  }
}

export default function client(url: string, fetchOptions?: object | (() => object)) {
  return new Client({
    url,
    fetchOptions
  }) as IClient;
}

export function uploadMiddleware(query: IQuery, request: RequestInit, next: () => void) {
  if (!query || !query.variables || !request.headers) return next();
  const { clone, files } = extractFiles({variables: query.variables});
  if (files.size === 0) return next();

  delete request.headers['content-type'];

  // GraphQL multipart request spec:
  // https://github.com/jaydenseric/graphql-multipart-request-spec
  const form = new FormData();
  form.append('operations', BSON.stringify({query: (isGQL(query.query)) ? query.query.loc.source.body : query.query, variables: clone.variables}));

  const map = {};
  let i     = 0;
  files.forEach((paths: string) => {
    map[++i] = paths;
  });
  form.append('map', JSON.stringify(map));

  i = 0;
  files.forEach((paths: string, file: File) => {
    form.append(String(++i), file, file.name);
  });

  request.body = form;
}