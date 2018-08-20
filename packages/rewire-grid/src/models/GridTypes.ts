import { EditorType }      from 'rewire-ui';
import { SearchFn, MapFn } from 'rewire-ui';
import { defaultEquals }   from 'rewire-core';
export { EditorType };

export interface IRows {
  rows: IRow[];
}

export interface IDisposable {
  dispose(): void;
}

export type SortDirection = 'ascending' | 'descending';
export type TextAlignment = 'left' | 'right' | 'center';

export interface IGrid extends IRows, IDisposable {
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

  cell(rowId: string, column: string): ICell | undefined;

  revert(): void;
  get(): any[];
  set(data: any[]): void;

  addColumn(column: IColumn): IColumn;

  addFixedRow(row: any): IRow;
  removeFixedRow(id: string): void;

  removeRow(id: string): void;
  addRow(row: any): IRow;
  addRows(rows: any[]): void;
}

export interface IGridColors {
  headerBackground?: string;
  headerText?: string;
  headerBorder?: string;
  gridBackground?: string;
  gridText?: string;
  gridBorder?: string;
  groupRowBackground?: string;
  rowSelectedBackground?: string;
  rowSelectedText?: string;
  rowStripedBackground?: string;
  rowStripedBackgroundSelected?: string;
  leftLabelBackground?: string;
  cellOutline?: string;
}

export interface IRowOptions {
  allowMergeColumns: boolean;
}

export interface IRow extends IDisposable {
  id           : string;
  grid         : IGrid;
  cells        : ICellMap;
  selected     : boolean;
  cls          : string;
  options      : IRowOptions;
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
  readOnly : boolean;
  align?   : TextAlignment;
  type     : EditorType;
  editor?  : React.SFC<any>;
  renderer?: React.SFC<any>;
  colSpan? : number;
  rowSpan? : number;
}

export interface IColumn extends ICellProperties {
  name          : string;
  title?        : string;
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

export interface IRowIteratorResult {
  rows: IRow[];
  row: IRow;
  idx: number;
}

export interface IGroupRowIteratorResult {
  rows: IRow[];
  row: IGroupRow;
  idx: number;
}

export function *groupRows(rows: IRow[]): IterableIterator<IGroupRowIteratorResult> {
  let result: any = {rows: rows, row: undefined, idx: 0};
  for (const row of rows) {
    if (isGroupRow(row)) {
      result.row = row;
      yield result;
      result.idx++;
      yield *groupRows(row.rows);
    }
  }
}

export function *allRows(rows: IRow[]): IterableIterator<IRowIteratorResult> {
  let result: any = {rows: rows, row: undefined, idx: 0};
  for (const row of rows) {
    result.row = row;
    yield result;
    result.idx++;
    if (isGroupRow(row)) {
      yield *allRows(row.rows);
    }
  }
}

export function *fixedRows(grid: IGrid): IterableIterator<IRowIteratorResult> {
  let result: any = {rows: grid.fixedRows, row: undefined, idx: 0};
  for (const row of grid.fixedRows) {
    result.row = row;
    yield result;
    result.idx++;
  }
}

export function *allDataRows(rows: IRow[]): IterableIterator<IRowIteratorResult> {
  let result: any = {rows: rows, row: undefined, idx: 0};
  for (const row of rows) {
    if (isGroupRow(row)) {
      yield *allDataRows(row.rows);
    } else {
      result.row = row;
      yield result;
      result.idx++;
    }
  }
}

export function find<T>(rows: IterableIterator<T>, predicate: (row: T) => boolean): T | undefined {
  if (!predicate) return undefined;

  for (const row of rows) {
    if (predicate(row)) return row;
  }
  return undefined;
}

export function findRowByData(rows: IRow[], row: any): IRowIteratorResult | undefined {
  return find(allDataRows(rows), (row) => defaultEquals(row.row.data, row));
}

export function findRowById(iterator: IterableIterator<IRowIteratorResult>, id: string): IRowIteratorResult | undefined {
  return find(iterator, (r) => r.row.id === id);
}

export function findColumn(columns: IColumn[], name: string): IColumn | undefined {
  return columns.find((column) => column.name === name);
}

export function collapseAll(rows: IRow[]) {
  for (const groupRow of groupRows(rows)) {
    groupRow.row.expanded = false;
  }
}

export function expandAll(rows: IRow[]) {
  for (const groupRow of groupRows(rows)) {
    groupRow.row.expanded = true;
  }
}