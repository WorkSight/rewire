import * as is             from 'is';
import {isNullOrUndefined} from 'rewire-common';
import {
  EditorType,
  SearchFn,
  MapFn,
  IActionMenuItem,
  IToggleMenuItem,
  ISuggestionsContainerComponent,
  Validator,
  IFormValidator,
  IError,
  TGetter,
  TSetter
} from 'rewire-ui';
import * as merge      from 'deepmerge';
import { ButtonProps } from '@material-ui/core/Button';
import {PopoverOrigin} from '@material-ui/core/Popover';
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
export interface IGridRowKeybindPermissions {
  insertRow: boolean;
  duplicateRow: boolean;
  deleteRow: boolean;
}

export type GridKeybindAction = (evt: React.KeyboardEvent<any>, cell: ICell) => void;
export interface IGridStaticKeybinds {
  'ArrowUp'          : GridKeybindAction;
  'ArrowDown'        : GridKeybindAction;
  'ArrowLeft'        : GridKeybindAction;
  'ArrowRight'       : GridKeybindAction;
  'Shift+ArrowUp'    : GridKeybindAction;
  'Shift+ArrowDown'  : GridKeybindAction;
  'Shift+ArrowLeft'  : GridKeybindAction;
  'Shift+ArrowRight' : GridKeybindAction;
  'Tab'              : GridKeybindAction;
  'Shift+Tab'        : GridKeybindAction;
  'Home'             : GridKeybindAction;
  'End'              : GridKeybindAction;
  'Ctrl+Home'        : GridKeybindAction;
  'Ctrl+End'         : GridKeybindAction;
  'Escape'           : GridKeybindAction;
  'Enter'            : GridKeybindAction;
  'F2'               : GridKeybindAction;
  'Ctrl+C'           : GridKeybindAction;
}
export interface IGridVariableKeybinds {
  'Ctrl+Shift+U'   : GridKeybindAction;
  'Ctrl+X'         : GridKeybindAction;
  'Ctrl+V'         : GridKeybindAction;
  'Delete'         : GridKeybindAction;
  'Ctrl+Insert'    : GridKeybindAction;
  'Ctrl+D'         : GridKeybindAction;
  'Ctrl+Delete'    : GridKeybindAction;
  [keybind: string]: GridKeybindAction;
}

export interface IGridOptionsMenu {
  tooltip?:         string;
  title?:           string | JSX.Element | (() => JSX.Element);
  menuId?:          string;
  buttonContent?:   JSX.Element;
  buttonProps?:     ButtonProps;
  anchorOrigin?:    PopoverOrigin;
  transformOrigin?: PopoverOrigin;
  items:            (IActionMenuItem | IToggleMenuItem)[];

  onItemClick?(item: IActionMenuItem | IToggleMenuItem): void;
}

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
  headerRowHeight?          : number;
  rowHeight?                : number;
  loading                   : boolean;
  readonly fixedColumns     : IColumn[];
  readonly standardColumns  : IColumn[];
  groupBy                   : IColumn[];
  isMouseDown               : boolean;
  multiSelect               : boolean;
  allowMergeColumns         : boolean;
  startCell?                : ICell;
  clearSelectionOnBlur?     : boolean;
  rowKeybindPermissions     : IGridRowKeybindPermissions;
  staticKeybinds            : IGridStaticKeybinds;
  variableKeybinds          : IGridVariableKeybinds;
  isRowCompleteFn           : (row: IRowData) => boolean;
  optionsMenu?              : IGridOptionsMenu;
  readonly validator        : Validator;
  readonly hasChanges       : boolean;
  readonly isChangeTracking : boolean;
  onError?                  : (row: IRow, field: string, error: IError | undefined) => void;

  setChangeTracking(enable: boolean): void;
  revert(): void;
  commit(): void;
  hasErrors(): boolean;
  getErrors(): IErrorData[];
  validate(): void;
  copy(): void;
  cut(): void;
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
  spliceColumns(start: number, deleteCount: number, ...columns: IColumn[]): void;
  column(columnName: string): IColumn | undefined;
  columnByPos(columnPosition: number): IColumn | undefined;

  clear(): void;
  clearSelectedCells(): void;
  get(): ICellDataMap[];
  set(data: (IRowData | undefined)[]): void;

  setColumnPositions(): void;

  addFixedRow(data?: IRowData, position?: number): IRow;
  removeFixedRow(id: string): void;

  setRowPositions(): void;
  removeRow(id: string): void;
  removeRows(ids: string[]): void;
  removeSelectedRows(reselect?: boolean): void;
  addRow(data?: IRowData, position?: number): IRow;
  addRows(data: (IRowData | undefined)[], position?: number): IRow[];
  duplicateRow(id: string, position?: number): IRow | undefined;
  duplicateRows(ids: string[], position?: number): IRow[];
  duplicateSelectedRows(): IRow[];
  insertRowAtSelection(data?: IRowData): IRow;
}

export interface IGridOptions {
  enabled?                 : boolean;
  readOnly?                : boolean;
  verticalAlign?           : VerticalAlignment;
  isDraggable?             : boolean;
  multiSelect?             : boolean;
  allowMergeColumns?       : boolean;
  clearSelectionOnBlur?    : boolean;
  groupBy?                 : string[];
  rowKeybindPermissions?   : IGridRowKeybindPermissions;
  variableKeybinds?        : {[keybind: string]: GridKeybindAction};
  isRowCompleteFn?         : (row: IRowData) => boolean;
  headerRowHeight?         : number;
  rowHeight?               : number;
  optionsMenuFn?           : () => IGridOptionsMenu;
}

export interface IGroupRow {
  expanded       : boolean;
  visible        : boolean;
  rows           : (IRow | IGroupRow)[];
  readonly title : string;
  readonly level : number;
  expand(): void;
  collapse(): void;
}

export interface IGridColors {
  headerBackground?: string;
  headerText?: string;
  headerBorder?: string;
  gridBackground?: string;
  gridSettingsIcon?: string;
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
  toggleMenu?: string;
}

export interface IRowOptions {
  cls?: string;
  visible?: boolean;
  fixed?: boolean;
  allowMergeColumns?: boolean;

  onClick?(row: IRow): void;
}

export interface IRowData {
  id?: string;
  data?: ICellDataMap;
  options?: IRowOptions;
}

export interface IRow extends IDisposable {
  id                            : string;
  grid                          : IGrid;
  cells                         : ICellMap;
  data                          : any;
  selected                      : boolean;
  cls?                          : string;
  allowMergeColumns?            : boolean;
  position                      : number;
  visible                       : boolean;
  fixed                         : boolean;
  options                       : IRowOptions;

  onClick?(row: IRow): void;
  hasErrors(): boolean;
  getErrors(): IErrorData[];
  createCell(column: IColumn, value: any, type?: string): ICell;
  clear(columnNames?: string[]): void;
  mergeAllColumns(): void;
  mergeFixedColumns(): void;
  mergeStandardColumns(): void;
  clone(): IRow;
  validate(): void;
}

export type MaskType = (string | RegExp)[];

export type IColumnEditor =
  'text' | 'date' | 'checked' | 'none' |
  {type: 'time', options?: {disableErrors?: boolean, rounding?: number, map?: MapFn<any>}} |
  {type: 'select', options: {search: SearchFn<any>, map: MapFn<any>}} |
  {type: 'multiselect', options: {search: SearchFn<any>, map: MapFn<any>}} |
  {type: 'number', options?: {decimals?: number, thousandSeparator?: boolean, fixed?: boolean, allowNegative?: boolean}} |
  {type: 'phone', options?: {format?: string, mask?: string}} |
  {type: 'mask', options?: {mask?: MaskType | (() => MaskType), guide?: boolean, placeholderChar?: string, showMask?: boolean}} |
  {type: 'auto-complete', options: {search: SearchFn<any>, map: MapFn<any>, openOnFocus?: boolean, showEmptySuggestions?: boolean, suggestionsContainerHeader?: ISuggestionsContainerComponent, suggestionsContainerFooter?: ISuggestionsContainerComponent}} |
  {type: 'multiselectautocomplete', options: {search: SearchFn<any>, map: MapFn<any>, openOnFocus?: boolean, showEmptySuggestions?: boolean, suggestionsContainerHeader?: ISuggestionsContainerComponent, suggestionsContainerFooter?: ISuggestionsContainerComponent, chipLimit?: number}};

export interface ICellProperties {
  id        : number;
  grid      : IGrid;
  cls?      : any;
  editable  : boolean;
  align?    : TextAlignment;
  renderer? : React.SFC<any>;
  colSpan   : number;
  rowSpan   : number;

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
  rowSpan?      : number;
  colSpan?      : number;
  tooltip?      : string;
  width?        : string;
  canSort?      : boolean;
  accessor?     : {getter: TGetter, setter: TSetter};
  renderer?     : React.SFC<any>;
  validators?   : IFormValidator;

  onValueChange?(cell: ICell, v: any): void;
  map?(value: any): string;
  predicate?(value: any, filter: {value: any}): boolean;
  compare?(x: any, y: any): number;
}

export interface IColumnData {
  name: string;
  title: string;
  options?: IColumnOptions;
}

export interface IColumn extends ICellProperties {
  name           : string;
  title          : string;
  type           : EditorType;
  tooltip?       : string;
  width?         : string;
  fixed          : boolean;
  visible        : boolean;
  verticalAlign  : VerticalAlignment;
  enabled        : boolean;
  readOnly       : boolean;
  position       : number;
  sort?          : SortDirection;
  canSort        : boolean;
  isGroupByColumn: boolean;
  typeOptions?   : any;
  editor?        : React.SFC<any>;

  map?(value: any): string;
  predicate?(value: any, filter: {value: any}): boolean;
  compare?(x: any, y: any): number;
  setEditor(type?: IColumnEditor): void;
}

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
  rowPosition          : number;
  columnPosition       : number;
  isTopMostSelection   : boolean;
  isRightMostSelection : boolean;
  isBottomMostSelection: boolean;
  isLeftMostSelection  : boolean;
  keyForEdit?          : string;
  hasChanges           : boolean;

  hasErrors(): boolean;
  getErrors(): IErrorData[];
  clone(row: IRow): ICell;
  clear(): void;
  setEditing(editing: boolean): void;
  canFocus(): boolean;
  setFocus(focus?: boolean): void;
  validate(): void;
  unselect(): void;
  performKeybindAction(evt: React.KeyboardEvent<any>): void;
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
  return !!row._expanded;
}

export function isColumn(column: any): column is IColumn {
  return !!(column && (column as IColumn).name);
}

export function getValue(row?: IRow | ObjectType, column?: IColumn): string | undefined {
  if (!row || !column) return undefined;
  let value: any = row[column.name];
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

export function find(rows: Iterable<IRow>, predicate: (row: IRow) => boolean): IRow | undefined {
  if (!predicate) return undefined;

  for (const row of rows) {
    if (predicate(row)) return row;
  }
  return undefined;
}

export function findRowById(iterator: Iterable<IRow>, id: string): IRow | undefined {
  return find(iterator, (r) => r.id === id);
}

export function findRowByPosition(iterator: Iterable<IRow>, position: number): IRow | undefined {
  return this.rows[position];
}

export function findColumnByName(columns: IColumn[], name: string): IColumn | undefined {
  return columns.find((column) => column.name === name);
}

export interface IColumnsToggleMenuOptions {
  onItemClick?(item: IToggleMenuItem, column: IColumn): void;
}

export function createColumnsToggleMenuItems(columns: IColumn[], columnNames: string[], options?: IColumnsToggleMenuOptions): IToggleMenuItem[] {
  const onToggleMenuItemClick = (column: IColumn) => (item: IToggleMenuItem) => {
    if (options && options.onItemClick) {
      options.onItemClick(item, column);
    } else {
      column.visible = !column.visible;
    }
  };
  const toggleableColumns = columnNames.map((name: string) => findColumnByName(columns, name)).filter((column: IColumn | undefined) => !isNullOrUndefined(column) && !column!.isGroupByColumn) as IColumn[];
  return toggleableColumns.map((column: IColumn, idx: number) => ({
    name: column.name,
    title: column.title,
    visible: () => column.visible,
    subheader: idx === 0 ? 'Toggleable Columns' : undefined,
    onClick: onToggleMenuItemClick(column),
  } as IToggleMenuItem));
}



// export function collapseAll(rows: IRow[]) {
//   for (const groupRow of groupRows(rows)) {
//     groupRow.row.expanded = false;
//   }
// }

// export function expandAll(rows: IRow[]) {
//   for (const groupRow of groupRows(rows)) {
//     groupRow.row.expanded = true;
//   }
// }