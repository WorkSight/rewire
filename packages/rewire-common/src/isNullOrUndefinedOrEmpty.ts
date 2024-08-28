export default function isNullOrUndefinedOrEmpty(value: any): value is null | undefined | '' {
  return value === undefined || value === null || value === '';
}
