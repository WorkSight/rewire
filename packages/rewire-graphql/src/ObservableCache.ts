import { ICache } from './types';
import is         from 'is';
import observable from 'rewire-core/observable';

export class ObservableCache implements ICache {
  store: ObjectType = {};

  write(query: string | undefined, data: ObjectType | any[]): any {
    if (!data) return;
    let cache: any = null;
    if (Array.isArray(data)) {
      cache = this.writeArray(data);
    } else if (is.object(data)) {
      cache = this.writeObject(data);
    }
    if (query) {
      this.store[query] = cache;
    }
    return cache;
  }

  writeObject(obj: ObjectType): ObjectType {
    let cachedValue = this.store[obj.id];
    let result      = cachedValue || observable({});

    for (const field in obj) {
      let value = obj[field];
      if (is.object(value)) {
        result[field] = this.writeObject(value);
      } else if (Array.isArray(value)) {
        result[field] = this.writeArray(value);
      } else {
        result[field] = value;
      }
    }

    if (!cachedValue && obj.id) {
      this.store[obj.id] = result;
    }

    return result;
  }

  writeArray(arr: any[]): any[] {
    return arr.map((obj) => (is.object(obj)) ? this.writeObject(obj) : obj);
  }

  read(query: string): any {
    return this.store[query];
  }

  invalidate(query: string): void {
    delete this.store[query];
  }

  invalidateAll(): void {
    this.store = {};
  }
}
