/* eslint-disable no-async-promise-executor */
import {
  IClientOptions,
  IMutation,
  IQuery,
  IQueryResponse,
  IClient,
  isGQL,
  GraphQLMiddleware,
  GQL,
  IObservable,
  ISubscription,
  IObserver
}                             from './types';
import { BSON }               from './bson';
import { hashString }         from './hash';
import {
  createClient,
  Client as SubscriptionClient,
  SubscribePayload
}                             from 'graphql-ws';
import { extractFiles }       from 'extract-files';
import { ExecutionResult }    from 'graphql';

class QueryObservable<T> implements IObservable<T> {
  _subscription: ISubscription | undefined;
  _observers: IObserver<T>[] = [];
  _disposeFn?: () => void;

  constructor(private client: SubscriptionClient, private query: SubscribePayload) {}

  subscribe(observer: IObserver<T>): ISubscription {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    self._observers.push(observer);
    const _subscription = {
      unsubscribe() {
        self._observers.splice(self._observers.indexOf(observer), 1);
        if ((self._observers.length === 0) && self._disposeFn) {
          self._disposeFn();
          self._disposeFn = undefined;
        }
      }
    };
    if (self._disposeFn) return _subscription;
    (async () => {
        try {
          self._disposeFn = self.client.subscribe(self.query, {
            next: (data: any) => self._observers.forEach(o => o.next(data)),
            error: (err: Error) => {
              console.error(err);
            },
            complete: () => self._observers.forEach(o => o.complete()),
          });
        }
        catch(err) {
          console.error(err);
          self._observers.forEach(o => o.error(err));
          return;
      }
    })();

    return _subscription;
  }
}

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
      const running = this.running[queryId];
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
        const reqInit = {
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
        const res      = await fetch(this.url, reqInit);
        const response = BSON.parse(await res.text());
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

  subscribe<T>(query: GQL, variables?: object): IObservable<ExecutionResult<T>> {
    if (!this.subscriptionClient) {
      const url = new URL(this.url);
      const protocol = (url.protocol == 'https:') ? 'wss:' : 'ws:';
      this.subscriptionClient = createClient({
        url: `${protocol}//${url.host}${url.pathname}`,
        lazy: true,
        retryAttempts: 200,
        shouldRetry: () => true,
        connectionParams: () => ({token: this.bearer})
      });
    }

    return new QueryObservable<ExecutionResult<T>>(this.subscriptionClient!, {query: (isGQL(query)) ? query.loc.source.body : query, variables: variables as Record<string, unknown>});
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
  files.forEach((paths: string[]) => {
    map[++i] = paths;
  });
  form.append('map', JSON.stringify(map));

  i = 0;
  files.forEach((paths: string[], file: File) => {
    form.append(String(++i), file, file.name);
  });

  request.body = form;
}