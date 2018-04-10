export interface IObject {
  [index: string]: any;
}

export default function omit(obj?: IObject | null, ...rest: string[]) {
  if (!obj) return undefined;
  return Object.keys(obj).reduce(function (acc: any, key) {
    if (rest.indexOf(key) === -1) acc[key] = obj[key];
    return acc;
  }, {});
}

