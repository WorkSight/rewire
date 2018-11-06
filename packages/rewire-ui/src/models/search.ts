import {fetch, match}               from 'rewire-common';
import {TextAlignment, TextVariant} from '../components/editors';

export interface ISearchOptions {
  parentId?: string;
}

export type MapFn<T> = (item?: T) => string;
export type SearchFn<T> = (searchText: string, options?: ISearchOptions) => Promise<T[]>;

export function defaultMap<T extends string>(item?: T): string {
  return item || '(empty)';
}

export function arraySearch<T>(suggestions: T[], map?: (item?: T) => string, value?: T) {
  let _map = map || defaultMap;

  function getSuggestions(value: string): T[] {
    let   count       = 0;
    let   regex       = match(value, 'i');

    return value.length === 0
      ? suggestions
      : suggestions.filter(suggestion => {
          const keep =
            count < 8 && regex.test(_map(suggestion as any));

          if (keep) {
            count += 1;
          }

          return keep;
        });
  }

  function search(searchText: string, options?: ISearchOptions): Promise<T[]> {
    return Promise.resolve(getSuggestions(searchText));
  }

  return { map: _map, search};
}

export function documentSearch(documentType: string) {
  return {
    async search(text: string, options: ISearchOptions) {
      let searchParams: any = {search: text};

      if (options && options.parentId) {
        searchParams.parentOrganizationKey = options.parentId;
      }

      return await fetch.get(`names/${documentType}`, searchParams) as any[];
    },

    map(item?: any): string {
      if (!item) return '';

      if (!item.code) {
        return item.name;
      }

      if (!item.name) {
        return item.code;
      }

      return `${item.code} - ${item.name}`;
    }
  };
}


export type RenderSuggestionFn<T> = (suggestion: T, {theme, isHighlighted}: any) => JSX.Element;

export interface ICustomProps<T> {
  readonly selectedItem?: T;
  visible?              : boolean;
  error?                : string;
  align?                : TextAlignment;
  variant?              : TextVariant;
  label?                : string;
  disableErrors?        : boolean;
  startAdornment?       : JSX.Element;
  endAdornment?         : JSX.Element;
  onSelectItem          : (value?: T) => void;
  search                : SearchFn<T>;
  map?                  : MapFn<T>;
  debounce?             : number | boolean;
  options?              : ISearchOptions;
  renderSuggestion?     : RenderSuggestionFn<T>;
}

