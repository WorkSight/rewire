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
  id                    : number;
  enabled               : boolean;
  rows                  : IRow[];
  fixedRows             : IRow[];
  columns               : IColumn[];
  readonly editingCell? : ICell;
  readonly selectedRows : IRow[];
  readonly selectedCells: ICell[];
  width                 : string;
  height                : string;
  fixedWidth            : string;
  readonly fixedColumns : IColumn[];
  readonly dataColumns  : IColumn[];
  dataRowsByPosition    : IRow[];
  groupBy               : IColumn[];
  clipboard             : ICell[];
  isMouseDown           : boolean;
  multiSelect           : boolean;
  startCell?            : ICell;

  hasChanges(): boolean;
  copy(): void;
  paste(): void;
  addSort(column: IColumn, sort?: SortDirection, insert?: boolean): IGrid;
  setSort(column: IColumn, sort?: SortDirection): IGrid;

  selectRows(rows: IRow[]): void;
  selectCells(cells: ICell[], multiSelect?: boolean, append?: boolean): void;
  unselectCells(cells: ICell[]): void;
  editCell(cell?: ICell): void;
  selectCellsTo(cell: ICell, append?: boolean): void;

  cell(rowId: string, column: string): ICell | undefined;
  cellByPos(rowPosition: number, columnPosition: number): ICell | undefined;
  getCellsByRange(colStart: number, rowStart: number, colEnd: number, rowEnd: number, allowCollapsed?: boolean): ICell[];
  adjacentTopCell(cell: ICell): ICell | undefined;
  adjacentLeftCell(cell: ICell): ICell | undefined;
  row(rowId: string): IRow | undefined;
  rowByPos(rowPosition: number): IRow | undefined;
  getRowsByRange(rowStart: number, rowEnd: number, allowCollapsed?: boolean): IRow[];
  column(columnName: string): IColumn | undefined;
  columnByPos(columnPosition: number): IColumn | undefined;

  revert(): void;
  get(): any[];
  set(data: any[]): void;

  addColumn(column: IColumn): IColumn;

  addFixedRow(row: any): IRow;
  removeFixedRow(id: string): void;

  removeRow(id: string): void;
  addRow(row: any): IRow;
  _addRow(row: any): IRow;
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
  cellSelectedBackground?: string;
  rowSelectedText?: string;
  rowStripedBackground?: string;
  rowStripedSelectedBackground?: string;
  leftLabelBackground?: string;
  cellOutline?: string;
}

export interface IGridFontSizes {
  header?: string;
  body?: string;
  groupRow?: string;
}

export interface IRowOptions {
  allowMergeColumns: boolean;
}

export interface IRow extends IDisposable {
  id                   : string;
  grid                 : IGrid;
  cells                : ICellMap;
  selected             : boolean;
  cls                  : string;
  options              : IRowOptions;
  position             : number;
  readonly data        : any;
  cellsByColumnPosition: ICell[];
  parentRow?           : IGroupRow;
  visible              : boolean;

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
  id        : number;
  grid      : IGrid;
  tooltip?  : string;
  cls       : any;
  enabled   : boolean;
  readOnly  : boolean;
  align?    : TextAlignment;
  type      : EditorType;
  editor?   : React.SFC<any>;
  renderer? : React.SFC<any>;
  colSpan?  : number;
  rowSpan?  : number;
  validator?: (value: any) => IError | undefined;
}

export interface IColumn extends ICellProperties {
  name          : string;
  title?        : string;
  width?        : string;
  fixed         : boolean;
  visible       : boolean;
  position      : number;
  readonly sort?: SortDirection;
  canSort?      : boolean;

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
  row                      : IRow;
  column                   : IColumn;
  error?                   : IError;
  selected                 : boolean;
  value                    : any;
  readonly editing         : boolean;
  rowSpan                  : number;
  colSpan                  : number;
  rowPosition              : number;
  columnPosition           : number;
  isTopMostSelection       : boolean;
  isLeftMostSelection      : boolean;
  isAdjacentToLeftSelection: boolean;
  isAdjacentToTopSelection : boolean;

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

export function *allDataRows(rows: IRow[], allowCollapsed: boolean = true): IterableIterator<IRowIteratorResult> {
  let result: any = {rows: rows, row: undefined, idx: 0};
  for (const row of rows) {
    if (isGroupRow(row) && (allowCollapsed || row.expanded)) {
      yield *allDataRows(row.rows, allowCollapsed);
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

export function findRowByPosition(iterator: IterableIterator<IRowIteratorResult>, position: number): IRowIteratorResult | undefined {
  return find(iterator, (r) => r.row.position === position);
}

export function findColumnByName(columns: IColumn[], name: string): IColumn | undefined {
  return columns.find((column) => column.name === name);
}

export function findColumnByPosition(columns: IColumn[], position: number): IColumn | undefined {
  return columns.find((column) => column.position === position);
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

export function cellPositionCompare(a: ICell, b: ICell): number {
  return a.rowPosition < b.rowPosition ? -1 : a.rowPosition > b.rowPosition ? 1 : a.columnPosition < b.columnPosition ? -1 : a.columnPosition > b.columnPosition ? 1 : 0;
}

export function rowPositionCompare(a: IRow, b: IRow): number {
  return a.position < b.position ? -1 : a.position > b.position ? 1 : 0;
}

export function columnPositionCompare(a: IColumn, b: IColumn): number {
  return a.position < b.position ? -1 : a.position > b.position ? 1 : 0;
}