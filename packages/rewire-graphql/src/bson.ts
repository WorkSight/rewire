export class BSON {
  static reviver(key: string, value?: any) {
    if (value !== null) return value;
    return undefined;
  }

  static replacer(key: string, value?: any) {
    if (!key || value !== undefined) return value;
    return null;
  }

  static parse(json: string): any {
    return JSON.parse(json, BSON.reviver);
  }

  static stringify(obj: any): any {
    return JSON.stringify(obj, BSON.replacer);
  }
}