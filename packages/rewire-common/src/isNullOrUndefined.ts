export default function isNullOrUndefined(value: any): value is null | undefined {
  return value === undefined || value === null;
}
