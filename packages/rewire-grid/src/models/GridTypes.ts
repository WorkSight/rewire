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
  readonly dataColumns      : IColumn[];
  dataRowsByPosition        : IRow[];
  originalDataRowsByPosition: IRow[];
  addedRows                 : IRowIteratorResult[];
  removedRows               : IRowIteratorResult[];
  groupBy                   : IColumn[];
  clipboard                 : ICell[];
  isMouseDown               : boolean;
  multiSelect               : boolean;
  startCell?                : ICell;
  changed                   : boolean;
  inError                   : boolean;

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

  selectRows(rows: IRow[]): void;
  selectCells(cells: ICell[], cellToFocus?: ICell, multiSelect?: boolean, append?: boolean): void;
  unselectCells(cells: ICell[], cellToFocus?: ICell): void;
  updateCellSelectionProperties(cells: ICell[]): void;
  editCell(cell?: ICell): void;
  selectCellsTo(cell: ICell, append?: boolean): void;
  selectCellsToMergeHelper(rows: IRow[], columnsToSelect: IColumn[]): IColumn[];
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
  get(): any[];
  getChanges(): any[];
  set(data: any[]): void;

  addColumn(column: IColumn): IColumn;

  addFixedRow(row: any, position?: number): IRow;
  removeFixedRow(id: string): void;

  _removeRow(rows: any, id: string): void;
  _removeGroupRow(rows: any, id: string): void;
  removeRow(id: string): void;
  removeRows(ids: string[]): void;
  removeSelectedRows(reselect?: boolean): void;
  addRow(row: any, position?: number): IRow;
  _addRow(row: any, position?: number): IRow;
  addRows(rows: any[], position?: number): void;
  _addRows(rows: any[], position?: number): IRow[];
  _duplicateRow(rows: any, id: string, position?: number): void;
  duplicateRow(id: string, position?: number): void;
  duplicateRows(ids: string[], position?: number): void;
  duplicateSelectedRows(): void;
  insertRowAtSelection(): void;
}

export interface IGridOptions {
  enabled?             : boolean;
  readOnly?            : boolean;
  verticalAlign?       : VerticalAlignment;
  isDraggable?         : boolean;
  multiSelect?         : boolean;
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
  readonly data        : ICellDataMap & any;
  cellsByColumnPosition: ICell[];
  parentRow?           : IGroupRow;
  visible              : boolean;
  isFixed              : boolean;

  hasChanges(): boolean;
  hasErrors(): boolean;
  getErrors(): IErrorData[];
  createCell(column: IColumn, value: any, type?: string): ICell;
  clear(columnNames?: string[]): void;
  _setValue(data: ICellDataMap): void;
  setValue(data: ICellDataMap): void;
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
  'text' | 'date' | 'checked' | 'password' | 'mask' | 'none' |
  {type: 'time', options?: {rounding?: number}} |
  {type: 'auto-complete', options: {search: SearchFn<any>, map: MapFn<any>}} |
  {type: 'select', options: {search: SearchFn<any>, map: MapFn<any>}} |
  {type: 'multiselect', options: {search: SearchFn<any>, map: MapFn<any>}} |
  {type: 'number', options?: {decimals?: number, thousandSeparator?: boolean, fixed?: boolean}} |
  {type: 'phone', options?: {format?: string, mask?: string}};

export interface ICellProperties {
  id       : number;
  grid     : IGrid;
  tooltip? : string;
  cls?     : any;
  editable : boolean;
  align?   : TextAlignment;
  renderer?: React.SFC<any>;
  colSpan? : number;
  rowSpan? : number;

  onValueChange?(cell: ICell, v: any): void;
}

export interface IColumn extends ICellProperties {
  name          : string;
  type          : EditorType;
  title?        : string;
  width?        : string;
  fixed         : boolean;
  visible       : boolean;
  verticalAlign?: VerticalAlignment;
  enabled?      : boolean;
  readOnly?     : boolean;
  position      : number;
  sort?         : SortDirection;
  canSort?      : boolean;
  options?      : any;
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
  rowSpan              : number;
  colSpan              : number;
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
  _setValue(v: any): void;
  setValue(v: any): void;
  validate(): void;
  _revert(): void;
  revert(): void;
  unselect(): void;
  findVerticallyNearestCellWithUnselectedRow(): ICell | undefined;
}

export type ICellMap     = {[columnName: string]: ICell};
export type ICellDataMap = {[columnName: string]: any};

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