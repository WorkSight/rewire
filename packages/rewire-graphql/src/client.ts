import {
  IClientOptions,
  IMutation,
  IQuery,
  IQueryResponse,
  IClient,
  isGQL,
  GQL
}                             from './types';
import { hashString }         from './hash';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { from, Stream }       from 'most';
import { ExecutionResult }    from 'graphql';

class Client implements IClient {
  url                : string; // Graphql API URL
  bearer?            : string; // bearer token
  fetchOptions       : object | (() => object); // Options for fetch call
  running            : {[idx: string]: Promise<IQueryResponse>} = {};
  subscriptionClient?: SubscriptionClient;

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

  executeQuery(queryObject: IQuery, headers?: object, skipCache: boolean = false, mutate: boolean = false): Promise<IQueryResponse> {
    const body    = JSON.stringify({query: (isGQL(queryObject.query)) ? queryObject.query.loc.source.body : queryObject.query, variables: queryObject.variables});
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
            'Content-Type': 'application/json',
            ...headers
          },
          method: 'POST',
          mode:   'cors',
          ...fetchOptions,
        };
        if (this.bearer) reqInit.headers.Authorization = 'Bearer ' + this.bearer;
        let res = await fetch(this.url, reqInit);
        let response = await res.json();
        if (res.ok) {
          resolve({data: response.data});
        } else {
          reject({error: response});
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
    return this.executeQuery({query, variables}, headers, false, mutate);
  }

  mutation(query: GQL, variables: object, headers?: object): Promise<IQueryResponse> {
    return this.query(query, variables, headers, true);
  }

  executeMutation(mutationObject: IMutation, headers?: object): Promise<IQueryResponse> {
    return this.executeQuery(mutationObject, headers, true, true);
  }
}

export default function client(url: string, fetchOptions?: object | (() => object)) {
  return new Client({
    url,
    fetchOptions
  }) as IClient;
}
