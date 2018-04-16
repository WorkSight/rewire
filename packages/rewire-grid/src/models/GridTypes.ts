import { EditorType }      from 'rewire-ui';
import { SearchFn, MapFn } from 'rewire-ui';
import { defaultEquals }   from 'rewire-core';
export { EditorType };

export interface IRows {
  rows: IRow[];
}

export type SortDirection = 'ascending' | 'descending';
export type TextAlignment = 'left' | 'right' | 'center';

export interface IGrid extends IRows {
  id                      : number;
  enabled                 : boolean;
  rows                    : IRow[];
  fixedRows               : IRow[];
  columns                 : IColumn[];
  readonly selectedRow?   : IRow;
  readonly selectedCell?  : ICell;
  readonly editingCell?   : ICell;
  width                   : string;
  height                  : string;
  fixedWidth              : string;
  readonly fixedColumns   : IColumn[];
  readonly dataColumns    : IColumn[];
  groupBy                 : IColumn[];

  hasChanges(): boolean;
  copy(): void;
  paste(): void;
  addSort(column: IColumn, sort?: SortDirection, insert?: boolean): IGrid;
  setSort(column: IColumn, sort?: SortDirection): IGrid;

  selectRow(row?: IRow): void;
  selectCell(cell?: ICell): void;
  editCell(cell?: ICell): void;

  addColumn(column: IColumn): IColumn;
  addFixedRow(row: any): IRow;
  addRow(row: any): IRow;
  addRows(rows: any[]): void;
}

export interface IRow {
  id           : number;
  grid         : IGrid;
  cells        : ICellMap;
  selected     : boolean;
  cls          : string;
  readonly data: any;

  hasChanges(): boolean;
  createCell(column: IColumn, value: any, type?: string): ICell;
}

export interface IGroupRow extends IRow, IRows {
  rows          : IRow[];
  column        : IColumn;
  readonly level: number;
  expanded      : boolean;
}

export type IColumnEditor =
  'text' | 'date' | 'time' | 'checked' | 'password' |
  {type: 'auto-complete', options: {search: SearchFn<any>, map: MapFn<any>}} |
  {type: 'select', options: {search: SearchFn<any>, map: MapFn<any>}} |
  {type: 'number', options: {decimals: number, thousandSeparator?: boolean, fixed?: boolean}};


export interface ICellProperties {
  id       : number;
  grid     : IGrid;
  tooltip? : string;
  cls      : any;
  enabled  : boolean;
  align?   : TextAlignment;
  type     : EditorType;
  editor?  : React.SFC<any>;
  renderer?: React.SFC<any>;
  colSpan? : number;
  rowSpan? : number;
}

export interface IColumn extends ICellProperties {
  name          : string;
  width?        : string;
  fixed         : boolean;
  visible       : boolean;
  readonly sort?: SortDirection;

  map?      (value: any): string;
  predicate?(value: any, filter: {value: any}): boolean;
  compare?  (x: any, y: any): number;
  setEditor (type?: IColumnEditor): void;
}

export enum ErrorSeverity {
  info,
  warning,
  error,
  critical
}
export interface IError { messageText: string; severity: ErrorSeverity; }

export interface ICell extends ICellProperties {
  row             : IRow;
  column          : IColumn;
  error?          : IError;
  selected        : boolean;
  value           : any;
  readOnly        : boolean;
  readonly editing: boolean;
  rowSpan?        : number;
  colSpan?        : number;

  hasChanges(): boolean;
  clone(row: IRow): ICell;
  clear(): void;
  setEditing(editing: boolean): void;
}

export type ICellMap = {[columnName: string]: ICell};

export function isRow(row: any): row is IRow {
  return !!(row && (row as IRow).createCell);
}

export function isGroupRow(row: any): row is IGroupRow {
  return (row && 'expanded' in row);
}

export function isColumn(column: any): column is IColumn {
  return !!(column && (column as IColumn).name);
}

export function getValue(row: IRow | ObjectType, column: IColumn): string | undefined {
  if (!row || !column) return undefined;

  let value =  ((row as IRow).data || row)[column.name];
  if (column.map) value = column.map(value);
  return value;
}

export function *groupRowIterator(rows: IRow[]): IterableIterator<IGroupRow> {
  for (const row of rows) {
    if (isGroupRow(row)) {
      yield row;
      yield *groupRowIterator(row.rows);
    }
  }
}

export function findRow(rows: IRow[], row: any): IRow | undefined {
  if (!row) return undefined;
  for (const row of rows) {
    if (isGroupRow(row)) {
      return findRow(row.rows, row);
    }

    if (defaultEquals(row.data, row)) return row;
  }
  return undefined;
}

export function findColumn(columns: IColumn[], name: string): IColumn | undefined {
  return columns.find((column) => column.name === name);
}

export function *allRows(rows: IRow[]): IterableIterator<IRow> {
  for (const row of rows) {
    yield row;
    if (isGroupRow(row)) {
      yield *groupRowIterator(row.rows);
    }
  }
}

export function collapseAll(rows: IRow[]) {
  for (const groupRow of groupRowIterator(rows)) {
    groupRow.expanded = false;
  }
}

export function expandAll(rows: IRow[]) {
  for (const groupRow of groupRowIterator(rows)) {
    groupRow.expanded = true;
  }
}