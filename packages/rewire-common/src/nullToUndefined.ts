export default function nullToUndefined(value: any): any {
  if (value === null) {
    return undefined;
  } else if (typeof value !== 'object') {
    return value;
  } else if (value instanceof Array) {
    for (const key of value) {
      nullToUndefined(key);
    }
  } else {
    for (const key in value) {
      if (value[key] === null) {
        value[key] = undefined;
      } else if (typeof value[key] === 'object') {
        nullToUndefined(value[key]);
      }
    }
  }
  return value;
}