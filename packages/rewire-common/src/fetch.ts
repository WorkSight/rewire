import * as qs from 'query-string';

const _timeout: number = 30 * 1000;
export interface IServerInfo {
  ssl:    string;
  domain: string;
  port:   string;
  vdir:   string;
  cors:   boolean;
  api:    string;
}

export function timeout(value: number) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Sorry, request timed out.'));
    }, value);
  });
}

export class Fetch {
  server: IServerInfo;
  url:    string;

  constructor(server?: IServerInfo) {
    this.server = server || {ssl: '', domain: 'localhost', port: ':44320', vdir: '', cors: true, api: 'ws'};
    this.url    = `http${this.server.ssl}://${this.server.domain}${this.server.port}/${this.server.vdir}${this.server.api}/`;
  }

  async json(response: any) {
    if (response.status === 401) {
      // messages.channel('ajax').action('unauthorized').post(true);
      const body = response && response.body ? response.json() : response;
      return body;
    }


    if ((response.status >= 200) && (response.status < 300)) {
      if (response.status === 200) {
        let v = await response.text();
        return v ? JSON.parse(v) : v;
      }
      return undefined;
    }

    try {
      let v = await response.text();
      let m: any = (v && JSON.parse(v)) || {msg: v};
      m.msg = m.ExceptionMessage || m.Message || m.msg;
      // messages.channel('ui-messages').action('error').post(m);
    } catch (ex)  {
      // messages.channel('ui-messages').action('error').post('unknown error occurred');
    }

    throw new Error('exception');
  }

  async blob(response: any) {
    if (response.status === 401) {
      // messages.channel('ajax').action('unauthorized').post(true);
      return response;
    }

    if ((response.status >= 200) && (response.status < 300)) {
      if (response.status === 200) {
        let v = await response.blob();
        return v;
      }
      return undefined;
    }

    throw new Error('exception');
  }

  async _fetch(url: string, opts: any = {}, ms: number, isBlob: boolean = false) {
    opts.credentials = 'include';
    opts.headers = {
      'Content-Type': 'application/json'
    };
    if (this.server.cors) {
      opts.mode    = 'cors';
      // Object.assign(opts.headers, {
      //   'Accept': '*/*',
      //   'Access-Control-Allow-Origin': 'http://localhost:3000',
      //   'Access-Control-Request-Method': opts.method || 'get',
      //   'Access-Control-Request-Headers' : 'authorization,content-type'
      // });
    }
    if (isBlob) return this.blob(await Promise.race([timeout(ms), fetch(url, opts)]));
    return this.json(await Promise.race([timeout(ms), fetch(url, opts)]));
  }

  get(api: string, params: any, ms: number = _timeout): Promise<any> {
    let queryString = qs.stringify(params);
    return this._fetch(this.url + api + (queryString ? ('?' + queryString) : ''), undefined, ms);
  }

  postBlob(api: string, data: any, ms: number = _timeout) {
    return this._fetch(this.url + api, {method: 'post', body: JSON.stringify(data)}, ms, true);
  }

  postQuery(api: string, params: any, data: any = {}, ms: number = _timeout) {
    let queryString = qs.stringify(params);
    return this._fetch(this.url + api + (queryString ? ('?' + queryString) : ''), {method: 'post', body: JSON.stringify(data)}, ms);
  }

  postForm(api: string, data: any, ms: number = _timeout) {
    return this._fetch(this.url + api, {method: 'post', body: new FormData(data)}, ms);
  }

  post(api: string, data: any, ms: number = _timeout) {
    return this._fetch(this.url + api, {method: 'post', body: JSON.stringify(data)}, ms);
  }

  async put(api: string, data: any, ms: number = _timeout) {
    return this._fetch(this.url + api, {method: 'put', body: JSON.stringify(data)}, ms);
  }

  async del(api: string, params: any, ms: number = _timeout) {
    let queryString = qs.stringify(params);
    return this._fetch(this.url + api + (queryString ? ('?' + queryString) : ''), {method: 'delete'}, ms);
  }
}

const r = new Fetch();
export default r;
