import { utc, DateRange, TimestampRange } from "rewire-common";

export class BSON {
  private static _types: {[converter: string]: (value: any) => any} = {};
  static reviver(key: string, value?: any) {
    if (value === null) {
      return undefined;
    }
    if (!value || !value.__type) return value;
    return BSON._types[value.__type](value.value);
  }

  static replacer(key: string, v?: any) {
    if (v === undefined) {
      return null;
    }

    const value = this[key];
    const type  = value && value.constructor && value.constructor.name;
    if (type && BSON._types[type]) return {__type: type, value: v};
    return v;
  }

  static parse(json: string): any {
    return JSON.parse(json, BSON.reviver);
  }

  static stringify(obj: any): any {
    return JSON.stringify(obj, BSON.replacer);
  }

  static register(type: string, converter: (value: any) => any) {
    BSON._types[type] = converter;
  }
}

BSON.register('UTC', (v) => utc(v));
BSON.register('DateRange', (v) => new DateRange(v));
BSON.register('TimestampRange', (v) => new TimestampRange(v));
