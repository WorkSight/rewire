import editor, { compare, EditorType } from '../components/editors';
import { SearchFn, MapFn }             from '../models/search';

export type Size = 'icon' | 'tiny' | 'small' | 'medium' | 'large' | 'full';
const sizeToPixels: {[P in Size]: number | undefined} = {
  'icon'  : 24,
  'tiny'  : 56,
  'small' : 96,
  'medium': 130,
  'large' : 220,
  'full'  : undefined,
};

export type ColumnEditorType =
  'text' | 'date' | 'time' | 'checked' | 'password' | 'number' |
  {type: 'auto-complete', options: {search: SearchFn<any>, map: MapFn<any>}} |
  {type: 'select', options: {search: SearchFn<any>, map: MapFn<any>}} |
  {type: 'number', options: {decimals: number, thousandSeparator?: boolean, fixed?: boolean}};

export interface ColumnType {
  name  : string;
  title : string;
  type  : EditorType;
  width?: number;
  align?: 'left' | 'right';
  editor: React.SFC<any>;

  map(row: any): string;
  predicate?(value: any, filter: {value: any, columnName: string}): boolean;
  compare?(x: any, y: any): number;
}

const toLowerCase = (value: string) => String(value).toLowerCase();

export default function column(name: string, title: string, type: ColumnEditorType): ColumnType;
export default function column(name: string, title: string, type: ColumnEditorType, width: Size): ColumnType;
export default function column(name: string, title: string, type: ColumnEditorType, width?: Size, align?: 'left' | 'right'): ColumnType {
  let options: any;
  let t: EditorType;
  if (typeof (type) === 'string') {
    t       = type;
  } else {
    t       = type.type;
    options = type.options;
  }

  const column: any = {name, title, type: type, width: width && sizeToPixels[width], align, editor: editor(t as EditorType, options)};
  if (options && options.map) {
    column.map       = (row: any) => options.map(row[name]);
    column.predicate = (value: any, filter: any) => toLowerCase(options.map(value)).includes(toLowerCase(filter.value));
    column.compare   = (x: any, y: any) => compare(options.map(x), options.map(y));
  }
  return column;
}
