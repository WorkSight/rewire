export function escapeRegExp(str: string) {
  // eslint-disable-next-line no-useless-escape
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

export default function match(searchText: string, options: string = 'gi') {
  return new RegExp(`${escapeRegExp(searchText)}`, options);
}
