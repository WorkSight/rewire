import {
  ICache,
  IClientOptions,
  IMutation,
  IQuery,
  IQueryResponse,
  IClient,
  isGQL,
  GQL
}                          from './types';
import { hashString }      from './hash';
import { ObservableCache } from './ObservableCache';

class Client implements IClient {
  url          : string; // Graphql API URL
  fetchOptions : object | (() => object); // Options for fetch call
  cache        : ICache; // Cache object
  running      : {[idx: string]: Promise<IQueryResponse>} = {};

  constructor(opts?: IClientOptions) {
    if (!opts) {
      throw new Error('Please provide configuration object');
    }
    // Set option/internal defaults
    if (!opts.url) {
      throw new Error('Please provide a URL for your GraphQL API');
    }

    this.url          = opts.url;
    this.fetchOptions = opts.fetchOptions || {};
    this.cache        = opts.cache || new ObservableCache();
  }

  executeQuery(queryObject: IQuery, skipCache: boolean = false, mutate: boolean = false): Promise<IQueryResponse> {
    const body    = JSON.stringify({query: (isGQL(queryObject.query)) ? queryObject.query.loc.source.body : queryObject.query, variables: queryObject.variables});
    const queryId = hashString(body);
    if (!skipCache && !mutate) {
      let data = this.cache.read(queryId);
      if (data) return Promise.resolve({ data, queryId });
    }

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
        let res =
        await fetch(this.url, {
          body,
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
          ...fetchOptions,
        });
        let response = await res.json();
        if (res.ok) {
          resolve({
            queryId,
            data: this.cache.write(mutate ? undefined : queryId, response.data)
          });
        } else {
          reject({queryId, error: response});
        }
      } catch (err) {
        reject(err);
      }
      delete this.running[queryId];
    });

    return promise;
  }

  query(query: GQL, variables?: object, mutate: boolean = false): Promise<IQueryResponse> {
    return this.executeQuery({query, variables}, false, mutate);
  }

  mutation(query: GQL, variables: object, mutate: boolean = false): Promise<IQueryResponse> {
    return this.query(query, variables, true);
  }

  executeMutation(mutationObject: IMutation): Promise<IQueryResponse> {
    return this.executeQuery(mutationObject, true, true);
  }
}

export default function create(url: string) {
  return new Client({
    url,
  }) as IClient;
}
