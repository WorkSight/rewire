export function escapeRegExp(str: string) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

export default function match(searchText: string, options: string = 'gi') {
  return new RegExp(`${escapeRegExp(searchText)}`, options);
}
