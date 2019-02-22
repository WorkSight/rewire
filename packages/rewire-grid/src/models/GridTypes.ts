import * as is             from 'is';
import { EditorType }      from 'rewire-ui';
import { SearchFn, MapFn } from 'rewire-ui';
import { IValidateFnData } from './Validator';
import merge               from 'deepmerge';
export { EditorType };

export interface IRows {
  rows: IRow[];
}

export interface IDisposable {
  dispose(): void;
}

export type SortDirection     = 'ascending' | 'descending';
export type TextAlignment     = 'left' | 'center' | 'right';
export type VerticalAlignment = 'top' | 'middle' | 'bottom';

export interface IGrid extends IRows, IDisposable {
  id                        : number;
  enabled                   : boolean;
  readOnly                  : boolean;
  verticalAlign             : VerticalAlignment;
  rows                      : IRow[];
  fixedRows                 : IRow[];
  columns                   : IColumn[];
  editingCell?              : ICell;
  selectedRows              : IRow[];
  selectedCells             : ICell[];
  focusedCell?              : ICell;
  fixedWidth                : string;
  loading                   : boolean;
  readonly fixedColumns     : IColumn[];
  readonly standardColumns  : IColumn[];
  dataRowsByPosition        : IRow[];
  originalDataRowsByPosition: IRow[];
  addedRows                 : IRowIteratorResult[];
  removedRows               : IRowIteratorResult[];
  groupBy                   : IColumn[];
  clipboard                 : ICell[];
  isMouseDown               : boolean;
  multiSelect               : boolean;
  allowMergeColumns         : boolean;
  startCell?                : ICell;
  changed                   : boolean;
  inError                   : boolean;
  contentElement?           : HTMLDivElement;

  setContentElement(element: HTMLDivElement | undefined): void;

  hasChanges(): boolean;
  hasErrors(): boolean;
  getErrors(): IErrorData[];
  validate(): void;
  copy(): void;
  paste(): void;
  addSort(column: IColumn, sort?: SortDirection, insert?: boolean): IGrid;
  setSort(column: IColumn, sort?: SortDirection): IGrid;
  sort(): void;
  sortItems(items: any[], comparer: (a: any, b: any) => number): void;
  mergeColumns(): void;
  mergeFixedRows(): void;

  selectRows(rows: IRow[]): void;
  selectCells(cells: ICell[], cellToFocus?: ICell, handleMergedCells?: boolean, append?: boolean): void;
  unselectCells(cells: ICell[], cellToFocus?: ICell): void;
  updateCellSelectionProperties(cells: ICell[]): void;
  editCell(cell?: ICell): void;
  selectCellsTo(cell: ICell, append?: boolean): void;
  selectCellByPos(rowPosition: number, columnPosition: number): void;
  selectCellsByRange(rowPosition1: number, rowPosition2: number, columnPosition1: number, columnPosition2: number): void;
  clearSelection(): void;

  cell(rowId: string, column: string): ICell | undefined;
  cellByPos(rowPosition: number, columnPosition: number): ICell | undefined;
  getCellsByRange(colStart: number, rowStart: number, colEnd: number, rowEnd: number, allowCollapsed?: boolean): ICell[];
  adjacentTopCell(cell: ICell, onlySelectable?: boolean): ICell | undefined;
  adjacentRightCell(cell: ICell, onlySelectable?: boolean): ICell | undefined;
  adjacentBottomCell(cell: ICell, onlySelectable?: boolean): ICell | undefined;
  adjacentLeftCell(cell: ICell, onlySelectable?: boolean): ICell | undefined;
  nextCell(cell: ICell, onlySelectable?: boolean): ICell | undefined;
  previousCell(cell: ICell, onlySelectable?: boolean): ICell | undefined;
  firstCell(onlySelectable?: boolean): ICell | undefined;
  lastCell(onlySelectable?: boolean): ICell | undefined;
  firstCellInRow(row: IRow, onlySelectable?: boolean): ICell | undefined;
  lastCellInRow(row: IRow, onlySelectable?: boolean): ICell | undefined;
  row(rowId: string): IRow | undefined;
  rowByPos(rowPosition: number): IRow | undefined;
  getRowsByRange(rowStart: number, rowEnd: number, allowCollapsed?: boolean): IRow[];
  column(columnName: string): IColumn | undefined;
  columnByPos(columnPosition: number): IColumn | undefined;

  revert(): void;
  revertSelectedCells(): void;
  revertSelectedRows(): void;
  get(): ICellDataMap[];
  getChanges(): ICellDataMap[];
  set(data: (IRowData | undefined)[]): void;

  addColumn(column: IColumn): IColumn;

  addFixedRow(data?: IRowData, position?: number): IRow;
  removeFixedRow(id: string): void;

  _removeRow(rows: IterableIterator<IRowIteratorResult>, id: string): void;
  _removeGroupRow(rows: IterableIterator<IRowIteratorResult>, id: string): void;
  removeRow(id: string): void;
  removeRows(ids: string[]): void;
  removeSelectedRows(reselect?: boolean): void;
  addRow(data?: IRowData, position?: number): IRow;
  _addRow(data?: IRowData, position?: number): IRow;
  addRows(data: (IRowData | undefined)[], position?: number): IRow[];
  _addRows(data: (IRowData | undefined)[], position?: number): IRow[];
  _duplicateRow(rows: IterableIterator<IRowIteratorResult>, id: string, position?: number): IRow | undefined;
  duplicateRow(id: string, position?: number): IRow | undefined;
  duplicateRows(ids: string[], position?: number): IRow[];
  duplicateSelectedRows(): IRow[];
  insertRowAtSelection(data?: IRowData): IRow;
}

export interface IGridOptions {
  enabled?             : boolean;
  readOnly?            : boolean;
  verticalAlign?       : VerticalAlignment;
  isDraggable?         : boolean;
  multiSelect?         : boolean;
  allowMergeColumns?   : boolean;
  groupBy?             : string[];
  // rowHotkeyPermissions?: IGridRowHotkeyPermissions;
}

export interface IGridColors {
  headerBackground?: string;
  headerText?: string;
  headerBorder?: string;
  gridBackground?: string;
  gridText?: string;
  gridBorder?: string;
  gridBorderSelected?: string;
  groupRowBackground?: string;
  rowSelectedBackground?: string;
  rowSelectedBorder?: string;
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
  cls?: string;
  visible?: boolean;
  fixed?: boolean;
  allowMergeColumns?: boolean;
}

export interface IRowData {
  id?: string;
  data?: ICellDataMap;
  options?: IRowOptions;
}

export interface IRow extends IDisposable {
  id                   : string;
  grid                 : IGrid;
  cells                : ICellMap;
  selected             : boolean;
  cls?                 : string;
  allowMergeColumns?   : boolean;
  position             : number;
  readonly originalData: ICellDataMap;
  cellsByColumnPosition: ICell[];
  parentRow?           : IGroupRow;
  visible              : boolean;
  fixed                : boolean;

  hasChanges(): boolean;
  hasErrors(): boolean;
  getErrors(): IErrorData[];
  createCell(column: IColumn, value: any, type?: string): ICell;
  clear(columnNames?: string[]): void;
  _setValue(data: ICellDataMap): boolean;
  setValue(data: ICellDataMap): boolean;
  mergeAllColumns(): void;
  mergeFixedColumns(): void;
  mergeStandardColumns(): void;
  clone(): IRow;
  validate(columnNames?: string[]): void;
  _revert(): void;
  revert(): void;
}

export interface IGroupRow extends IRow, IRows {
  rows          : IRow[];
  column        : IColumn;
  readonly level: number;
  expanded      : boolean;
}

export type IColumnEditor =
  'text' | 'date' | 'checked' | 'mask' | 'none' |
  {type: 'time', options?: {rounding?: number}} |
  {type: 'auto-complete', options: {search: SearchFn<any>, map: MapFn<any>}} |
  {type: 'select', options: {search: SearchFn<any>, map: MapFn<any>}} |
  {type: 'multiselect', options: {search: SearchFn<any>, map: MapFn<any>}} |
  {type: 'number', options?: {decimals?: number, thousandSeparator?: boolean, fixed?: boolean}} |
  {type: 'phone', options?: {format?: string, mask?: string}};

export interface ICellProperties {
  id       : number;
  grid     : IGrid;
  cls?     : any;
  editable : boolean;
  align?   : TextAlignment;
  renderer?: React.SFC<any>;
  colSpan  : number;
  rowSpan  : number;

  onValueChange?(cell: ICell, v: any): void;
}

export interface IColumnOptions {
  type?         : IColumnEditor;
  cls?          : any;
  enabled?      : boolean;
  readOnly?     : boolean;
  editable?     : boolean;
  fixed?        : boolean;
  visible?      : boolean;
  align?        : TextAlignment;
  verticalAlign?: VerticalAlignment;
  rowSpan? : number;
  colSpan?      : number;
  tooltip?      : string;
  width?        : string;
  canSort?      : boolean;
  renderer?     : React.SFC<any>;
  validator?    : IValidateFnData;

  onValueChange?(cell: ICell, v: any): void;
  compare?(x: any, y: any): number;
}

export interface IColumnData {
  name: string;
  title: string;
  options?: IColumnOptions;
}

export interface IColumn extends ICellProperties {
  name          : string;
  title         : string;
  type          : EditorType;
  tooltip?      : string;
  width?        : string;
  fixed         : boolean;
  visible       : boolean;
  verticalAlign : VerticalAlignment;
  enabled       : boolean;
  readOnly      : boolean;
  position      : number;
  sort?         : SortDirection;
  canSort       : boolean;
  typeOptions?  : any;
  editor?       : React.SFC<any>;
  validator?    : IValidateFnData;

  map?(value: any): string;
  predicate?(value: any, filter: {value: any}): boolean;
  compare?(x: any, y: any): number;
  setEditor(type?: IColumnEditor): void;
}

export enum ErrorSeverity {
  Info,
  Warning,
  Error,
  Critical
}
export interface IError { messageText: string; severity: ErrorSeverity; }
export interface IErrorData { name: string; error: IError; }

export interface ICell extends ICellProperties {
  row                  : IRow;
  column               : IColumn;
  error?               : IError;
  selected             : boolean;
  value                : any;
  verticalAlign        : VerticalAlignment;
  enabled              : boolean;
  readOnly             : boolean;
  readonly editing     : boolean;
  element?             : HTMLTableDataCellElement;
  rowPosition          : number;
  columnPosition       : number;
  isTopMostSelection   : boolean;
  isRightMostSelection : boolean;
  isBottomMostSelection: boolean;
  isLeftMostSelection  : boolean;

  hasChanges(): boolean;
  hasErrors(): boolean;
  getErrors(): IErrorData[];
  clone(row: IRow): ICell;
  clear(): void;
  setEditing(editing: boolean): void;
  canFocus(): boolean;
  setFocus(focus?: boolean): void;
  setElement(element: HTMLTableDataCellElement | undefined): void;
  _setValue(v: any): boolean;
  setValue(v: any): boolean;
  validate(): void;
  _revert(): void;
  revert(): void;
  unselect(): void;
  findVerticallyNearestCellWithUnselectedRow(): ICell | undefined;
}

export type ICellMap     = {[columnName: string]: ICell};
export type ICellDataMap = {[columnName: string]: any};

export interface ICellCustomValue {
  clone?(): any;
  toString?(): string;
}

export function isRow(row: any): row is IRow {
  return !!(row && (row as IRow).createCell);
}

export function isGroupRow(row: any): row is IGroupRow {
  return (row && 'expanded' in row);
}

export function isColumn(column: any): column is IColumn {
  return !!(column && (column as IColumn).name);
}

export function getValue(row?: IRow | ObjectType, column?: IColumn): string | undefined {
  if (!row || !column) return undefined;
  let value: any;
  if (isGroupRow(row)) {
    value = row.cells[column.name].value;
  } else {
    value = row[column.name];
  }

  if (column.map) value = column.map(value);
  return value;
}

export function cloneValue(value: any): any {
  if (is.array(value)) {
    return value.map((v: any) => this.cloneValue(v));
  } else if (is.object(value)) {
    return value.clone ? value.clone() : merge({}, value);
  } else {
    return value;
  }
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

export function findRowByCellData(rows: IRow[], cell: ICell): IRowIteratorResult | undefined {
  return find(allDataRows(rows), (r) => {
    let rCell = r.row.cells[cell.column.name];
    return !!rCell && (rCell.value === cell.value || (!!rCell.column.compare && rCell.column.compare(rCell.value, cell.value) === 0));
  });
}

export function findRowByRowData(rows: IRow[], row: any): IRowIteratorResult | undefined {
  return find(allDataRows(rows), (r) => {
    let match            = false;
    let rCellDataByName  = r.row.cells;
    let rowCellDataByPos = row.cellsByColumnPosition;

    for (let i = 0; i < rowCellDataByPos.length; i++) {
      let rowCell = rowCellDataByPos[i];
      let rCell   = rCellDataByName[rowCell.column.name];
      if (!rCell) {
        continue;
      }

      if (rCell === rowCell || rCell.value === rowCell.value || (rCell.column.compare && rCell.column.compare(rCell.value, rowCell.value) === 0)) {
        match = true;
        break;
      }
    }
    return match;
  });
}

export function findRowByRowDataExact(rows: IRow[], row: any): IRowIteratorResult | undefined {
  return find(allDataRows(rows), (r) => {
    let rCellData   = r.row.cellsByColumnPosition;
    let rowCellData = row.cellsByColumnPosition;
    if (rCellData.length !== rowCellData.length) {
      return false;
    }

    let same = true;
    for (let i = 0; i < rCellData.length; i++) {
      let rCell   = rCellData[i];
      let rowCell = rowCellData[i];
      if (rCell.column.compare) {
        if (rCell.column.compare(rCell.value, rowCell.value) !== 0) {
          same = false;
          break;
        }
      } else {
        if (rCell.value !== rowCell.value) {
          same = false;
          break;
        }
      }
    }
    return same;
  });
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