import { isNullOrUndefined, guid } from 'rewire-common';
import {
  observable,
  computed,
  observe,
  freeze,
  root,
  sample
}                                  from 'rewire-core';
import {
  compare,
  Validator,
  ChangeTracker,
  IChangeTrackerContext
}                                     from 'rewire-ui';
import * as merge                     from 'deepmerge';
import { CellModel }                  from './CellModel';
import { ColumnModel }                from './ColumnModel';
import {
  gridStaticKeybinds,
  gridDefaultVariableKeybinds
}                                     from './GridKeybinds';
import {
  IGrid,
  ICell,
  IRow,
  IColumn,
  IErrorData,
  SortDirection,
  findColumnByName,
  IDisposable,
  findRowById,
  IGridOptions,
  VerticalAlignment,
  IGridRowKeybindPermissions,
  IGridStaticKeybinds,
  IGridVariableKeybinds,
  IRowData,
  IGridOptionsMenu,
  IGroupRow,
  findGroupRowById,
}                                     from './GridTypes';
import createRow, { RowModel }        from './RowModel';
import GroupRowModel                  from './GroupRowModel';
import {
  ReorderableGridRowsCell,
  IReorderableGridRowsCellProps,
}                                     from '../components/ReorderableGridRows';

class GridChangeTrackerContext implements IChangeTrackerContext {
  constructor(private _grid: GridModel, public isComplete: (value: any) => boolean, public depth: number = 2) {}

  get length(): number {
    return this._grid.rows.length;
  }

  onHasChanges(value: boolean): void {
    this._grid.hasChanges = value;
  }

  getRow(index: number) {
    if ((index < 0) || (index >= this._grid.rows.length)) return undefined;
    return this._grid.rows[index];
  }

  setRow(index: number, value: any): void {
    if ((index < 0) || (index >= this._grid.rows.length)) return;
    const row = this._grid.rows[index];
    if (!row || !row.data) return;
    Object.assign(row.data, value);
  }
}

let id = 0;
class GridModel implements IGrid, IDisposable {
  _standardColumns          : () => IColumn[];
  _fixedColumns             : () => IColumn[];
  _visibleFixedColumns      : () => IColumn[];
  _visibleStandardColumns   : () => IColumn[];
  _groupRows                : () => IGroupRow[];
  _groupColumns             : IColumn[];
  _sort                     : IColumn[];
  id                        : number;
  enabled                   : boolean;
  readOnly                  : boolean;
  verticalAlign             : VerticalAlignment;
  rows                      : IRow[];
  fixedRows                 : IRow[];
  headerRowHeight?          : number;
  columns                   : IColumn[];
  editingCell?              : ICell;
  selectedRows              : IRow[];
  selectedCells             : ICell[];
  focusedCell?              : ICell;
  previousFocusedCell?      : ICell;
  fixedWidth                : string;
  rowHeight?                : number;
  loading                   : boolean;
  isReorderable             : boolean;
  reorderableCellRenderer   : (props: IReorderableGridRowsCellProps) => JSX.Element;
  clipboard                 : {value: any, columnPosition: number}[];
  multiSelect               : boolean;
  allowMergeColumns         : boolean;
  __isMouseDown             : boolean;
  __isReorderingMouseDown   : boolean;
  clearSelectionOnBlur      : boolean;
  rowKeybindPermissions     : IGridRowKeybindPermissions;
  staticKeybinds            : IGridStaticKeybinds;
  variableKeybinds          : IGridVariableKeybinds;
  startCell?                : ICell;
  hasChanges                : boolean;
  optionsMenu?              : IGridOptionsMenu;
  __validator               : Validator;
  __changeTracker?          : ChangeTracker;
  __isRowCompleteFn         : (row: IRowData) => boolean;
  __canSelectCellFn         : (Cell: ICell) => boolean;

  private _dispose: () => void;

  private constructor() { }

  private initialize(dispose: () => void, options?: IGridOptions) {
    this.__validator                = new Validator();
    this._dispose                   = dispose;
    this._sort                      = [];
    this._groupColumns              = observable([]);
    this.id                         = id++;
    this.rows                       = [];
    this.fixedRows                  = [];
    this.columns                    = [];
    this.editingCell                = undefined;
    this.selectedRows               = [];
    this.selectedCells              = [];
    this.focusedCell                = undefined;
    this.previousFocusedCell        = undefined;
    this.fixedWidth                 = '1px';
    this.loading                    = false;
    this.hasChanges                 = false;
    this.enabled                    = options && !isNullOrUndefined(options.enabled) ? options.enabled! : true;
    this.readOnly                   = options && !isNullOrUndefined(options.readOnly) ? options.readOnly! : false;
    this.verticalAlign              = options && options.verticalAlign || 'middle';
    this.isReorderable              = options && !isNullOrUndefined(options.isReorderable) ? options.isReorderable! : false;
    this.reorderableCellRenderer    = options && options.reorderableCellRenderer || ReorderableGridRowsCell;
    this.multiSelect                = options && !isNullOrUndefined(options.multiSelect) ? options.multiSelect! : false;
    this.allowMergeColumns          = options && !isNullOrUndefined(options.allowMergeColumns) ? options.allowMergeColumns! : false;
    this.clearSelectionOnBlur       = options && !isNullOrUndefined(options.clearSelectionOnBlur) ? options.clearSelectionOnBlur! : true;
    this.isRowCompleteFn            = options && options.isRowCompleteFn || (() => true);
    this.canSelectCellFn            = options && options.canSelectCellFn || (() => true);
    this.headerRowHeight            = options && !isNullOrUndefined(options.headerRowHeight) ? options.headerRowHeight : undefined;
    this.rowHeight                  = options && !isNullOrUndefined(options.rowHeight) ? options.rowHeight : undefined;
    this.clipboard                  = [];
    this.__isMouseDown              = false;
    this.__isReorderingMouseDown    = false;
    this.startCell                  = undefined;

    this.rowKeybindPermissions = {
      insertRow:    options && options.rowKeybindPermissions && !isNullOrUndefined(options.rowKeybindPermissions.insertRow) ? options.rowKeybindPermissions.insertRow : true,
      duplicateRow: options && options.rowKeybindPermissions && !isNullOrUndefined(options.rowKeybindPermissions.duplicateRow) ? options.rowKeybindPermissions.duplicateRow : true,
      deleteRow:    options && options.rowKeybindPermissions && !isNullOrUndefined(options.rowKeybindPermissions.deleteRow) ? options.rowKeybindPermissions.deleteRow : true,
    };

    this.staticKeybinds   = Object.assign({}, gridStaticKeybinds);
    this.variableKeybinds = merge(gridDefaultVariableKeybinds, options && options.variableKeybinds || {}) as IGridVariableKeybinds;

    if (this.rows && (this.rows.length > 0)) {
      this.selectedRows = [this.rows[0]];
    }

    const columnsFixedObs = observe(() => {this.columns.map((column: IColumn) => column.fixed); });
    this._fixedColumns    = computed(columnsFixedObs, () => this.columns.filter((h) => h.fixed), []);
    this._standardColumns = computed(columnsFixedObs, () => this.columns.filter((h) => !h.fixed), []);

    const columnsVisibleFixedObs = observe(() => {this.columns.map((column: IColumn) => column.visible && column.fixed); });
    this._visibleFixedColumns    = computed(columnsVisibleFixedObs, () => this.columns.filter((c) => c.visible && c.fixed), []);
    this._visibleStandardColumns = computed(columnsVisibleFixedObs, () => this.columns.filter((c) => c.visible && !c.fixed), []);

    this._groupRows = computed(() => this.rows.length && this.groupBy.length, this.groupRowsComputation, []);

    return this;
  }

  private groupRowsComputation = () => {
    if (!this.groupBy || (this.groupBy.length === 0)) return [] as IGroupRow[];
    const groupMap = {};
    const groups: IGroupRow[] = [];
    for (const row of this.rows) {
      let parentGroup: IGroupRow | undefined;
      for (let level = 0; level < this.groupBy.length; level++) {
        const key   = this.getGroupKey(row, this.groupBy, level + 1);
        let   group = groupMap[key];
        if (!group) {
          const value = this.getGroupValue(row, this.groupBy[level]);
          group = groupMap[key] = new GroupRowModel(value, level, key);
          if (!parentGroup) groups.push(group);
          else parentGroup.rows.push(group);
        }

        parentGroup = group;
        if (level === this.groupBy.length - 1) {
          parentGroup!.rows.push(row);
          if (!row.groupRow) {
            row.groupRow = parentGroup!;
          } else {
            Object.assign(row.groupRow, parentGroup!);
          }
        }
      }
    }
    return groups;
  }

  private getGroupValue(row: IRow, column: IColumn) {
    const v = row && row.data && column && row.data[column.name];
    return (v === null || v === undefined || Number.isNaN(v)) ? '(none)' : (column.map && column.map(v)) || String(v);
  }

  private getGroupKey(row: IRow, groupBy: IColumn[], level: number): string {
    const key: string[] = [];
    for (let index = 0; index < level; index++) {
      const column        = groupBy[index];
      const valueAsString = this.getGroupValue(row, column);
      key.push(valueAsString);
    }
    return key.join('->');
  }

  private disposeRows() {
    for (const row of this.rows) {
      row.dispose();
    }
  }

  get isMouseDown(): boolean {
    return this.__isMouseDown;
  }
  set isMouseDown(value: boolean) {
    this.__isMouseDown = value;
  }

  get isReorderingMouseDown(): boolean {
    return this.__isReorderingMouseDown;
  }
  set isReorderingMouseDown(value: boolean) {
    this.__isReorderingMouseDown = value;
  }

  dispose() {
    this.disposeRows();
    this.__changeTracker && this.__changeTracker.dispose();
    delete this.__changeTracker;
    if (this._dispose) this._dispose();
  }

  get validator() {
    return this.__validator;
  }

  get isChangeTracking(): boolean {
    return !!this.__changeTracker;
  }

  setChangeTracking(enable: boolean) {
    if (enable) {
      if (this.__changeTracker) return;
      this.__changeTracker = new ChangeTracker(new GridChangeTrackerContext(this, this.isRowCompleteFn));
      this.__changeTracker.set(this.rows);
      this.hasChanges      = false;
      return;
    }
    if (!this.__changeTracker) return;
    this.__changeTracker.dispose();
    delete this.__changeTracker;
    this.hasChanges = false;
  }

  public getChangeTracker() {
    return this.__changeTracker;
  }

  get isRowCompleteFn() {
    return this.__isRowCompleteFn;
  }

  set isRowCompleteFn(value: (row: IRowData) => boolean) {
    this.__isRowCompleteFn = value || (() => true);
    if (this.__changeTracker) this.__changeTracker.setIsCompleteRowFn(this.__isRowCompleteFn);
  }

  get canSelectCellFn() {
    return this.__canSelectCellFn;
  }

  set canSelectCellFn(value: (cell: ICell) => boolean) {
    this.__canSelectCellFn = value || (() => true);
  }

  revert(): void {
    if (this.__changeTracker) {
      this.__changeTracker.revert();
      this.validate();
      this.mergeColumns();
    }
  }

  commit(): void {
    if (this.__changeTracker) {
      this.__changeTracker.commit();
    }
  }

  copy() {
    let selectedCells = this.selectedCells;
    if (selectedCells.length <= 0) {
      return;
    }

    let copiedCells: any[] = [];
    selectedCells.forEach(cell => {
      copiedCells.push({value: cell.value, columnPosition: cell.columnPosition});
    });
    this.clipboard = copiedCells;
  }

  cut() {
    this.copy();
    this.selectedCells.forEach(cell => cell.clear());
  }

  get(): IRowData[] {
    return this.rows;
  }

  set(data: (IRowData | undefined)[]): void {
    this.loading = true;
    freeze(() => {
      this.disposeRows();
      this.rows.length          = 0;
      this.selectedRows.length  = 0;
      this.selectedCells.length = 0;
    });
    freeze(() => {
      this._addRows(data);
    });
    this.loading = false;
    this.validate();
    this.mergeColumns();
  }

  getCellsByRange(colStart: number, rowStart: number, colEnd: number, rowEnd: number, allowCollapsed: boolean): ICell[] {
    let cells: ICell[] = [];
    let rows = this.getRowsByRange(rowStart, rowEnd, allowCollapsed);
    rows.forEach(row => {
      for (let j = colStart; j <= colEnd; j++) {
        let cellToAdd = row.cells[this.columns[colStart].name];
        if (cellToAdd.rowSpan <= 0) {
          continue;
        }

        cells.push(cellToAdd);
      }
    });

    return cells;
  }

  getRowsByRange(rowStart: number, rowEnd: number, allowCollapsed: boolean): IRow[] {
    let rows: IRow[] = [];
    let rowCount     = this.rows.length;
    let start        = Math.max(0, Math.min(rowStart, rowEnd));
    let end          = Math.min(rowCount - 1, Math.max(rowStart, rowEnd));

    for (let i = start; i <= end; i++) {
      let row = this.rowByPos(i);
      if (row && (allowCollapsed || row.visible)) {
        rows.push(row);
      }
    }

    return rows;
  }

  cell(rowId: string, columnName: string): ICell | undefined {
    const row = this.row(rowId);
    return row && row.cells[columnName];
  }

  cellByPos(rowPosition: number, columnPosition: number): ICell | undefined {
    if (rowPosition < 0 || rowPosition >= this.rows.length || columnPosition < 0 || columnPosition >= this.columns.length) {
      return undefined;
    }

    const cell = this.rows[rowPosition].cells[this.columns[columnPosition].name];
    if (!cell) return undefined;
    return cell;
  }

  move(cell: ICell, byRows: number = 1, byColumns: number = 1, onlySelectable: boolean = false) {
    return sample(() =>  {
      let currentRowPosition    = cell.rowPosition;
      let row: IRow | undefined = cell.row;
      let rowDirection          = (byRows) > 0 ? 1 : -1;
      while (byRows !== 0 && (currentRowPosition >= 0) && (currentRowPosition < this.rows.length))  {
        currentRowPosition += rowDirection;
        const r             = this.rows[currentRowPosition];
        if (r && r.visible) {
          const c = r.cells[cell.column.name];
          if (c && (c.rowSpan > 0) && (!onlySelectable || c.canSelect)) {
            byRows -= rowDirection;
            row     = r;
          }
        }
      }

      let   currentColumnPosition       = cell.columnPosition;
      let   column: IColumn | undefined = cell.column;
      let   columnDirection             = (byColumns) > 0 ? 1 : -1;
      const c2                          = row.cells[column.name];
      if (c2.colSpan === 0 && (byColumns === 0)) byColumns = -1;
      while (byColumns !== 0 && (currentColumnPosition >= 0) && (currentColumnPosition < this.columns.length))  {
        currentColumnPosition += columnDirection;
        const col              = this.columns[currentColumnPosition];
        if (col && col.visible) {
          const c3 = row.cells[col.name];
          if (c3 && (c3.colSpan > 0) && (!onlySelectable || c3.canSelect)) {
            byColumns -= columnDirection;
            column     = col;
          }
        }
      }

      const c4 = row.cells[column.name];
      return (c4 === cell) ? undefined : c4;
    });
  }

  adjacentTopCell(cell: ICell, onlySelectable: boolean = false): ICell | undefined {
    return this.move(cell, -1, 0, onlySelectable);
  }

  adjacentBottomCell(cell: ICell, onlySelectable: boolean = false): ICell | undefined {
    return this.move(cell, 1, 0, onlySelectable);
  }

  adjacentRightCell(cell: ICell, onlySelectable: boolean = false): ICell | undefined {
    return this.move(cell, 0, 1, onlySelectable);
  }

  adjacentLeftCell(cell: ICell, onlySelectable: boolean = false): ICell | undefined {
    return this.move(cell, 0, -1, onlySelectable);
  }

  nextCell(cell: ICell, onlySelectable: boolean = false): ICell | undefined {
    let nextCell = this.move(cell, 0, 1, onlySelectable);
    if (nextCell === undefined) {
      nextCell = this.move(cell, 1, -cell.columnPosition, onlySelectable);
      if ((nextCell === undefined) || (nextCell.row === cell.row)) return undefined;
    }
    return nextCell;
  }

  previousCell(cell: ICell, onlySelectable: boolean = false): ICell | undefined {
    let prevCell = this.move(cell, 0, -1, onlySelectable);
    if (prevCell === undefined) {
      prevCell = this.move(cell, -1, this.columns.length - cell.columnPosition, onlySelectable);
      if ((prevCell === undefined) || (prevCell.row === cell.row)) return undefined;
    }
    return prevCell;
  }

  firstCell(onlySelectable: boolean = false): ICell | undefined {
    let firstCell = this.cellByPos(0, 0);
    if (firstCell && (firstCell.colSpan === 0 || (onlySelectable && !firstCell.canSelect))) {
      firstCell = this.nextCell(firstCell, onlySelectable);
    }

    return firstCell;
  }

  lastCell(onlySelectable: boolean = false): ICell | undefined {
    let lastCell = this.cellByPos(this.rows.length - 1, this.columns.length - 1);
    if (lastCell && (lastCell.colSpan === 0 || (onlySelectable && !lastCell.canSelect))) {
      lastCell = this.previousCell(lastCell, onlySelectable);
    }

    return lastCell;
  }

  firstCellInRow(row: IRow, onlySelectable: boolean = false): ICell | undefined {
    let firstCellInRow = this.cellByPos(row.position, 0);
    if (firstCellInRow && (firstCellInRow.colSpan === 0 || (onlySelectable && !firstCellInRow.canSelect))) {
      firstCellInRow = this.adjacentRightCell(firstCellInRow, onlySelectable);
    }

    return firstCellInRow;
  }

  lastCellInRow(row: IRow, onlySelectable: boolean = false): ICell | undefined {
    let lastCellInRow = this.cellByPos(row.position, this.columns.length - 1);
    if (lastCellInRow && (lastCellInRow.colSpan === 0 || (onlySelectable && !lastCellInRow.canSelect))) {
      lastCellInRow = this.adjacentLeftCell(lastCellInRow, onlySelectable);
    }

    return lastCellInRow;
  }

  row(rowId: string): IRow | undefined {
    return findRowById(this.rows, rowId);
  }

  rowByPos(rowPosition: number): IRow | undefined {
    if (rowPosition < 0 || rowPosition >= this.rows.length) {
      return undefined;
    }

    return this.rows[rowPosition];
  }

  column(columnName: string): IColumn | undefined {
    return findColumnByName(this.columns, columnName);
  }

  columnByPos(columnPosition: number): IColumn | undefined {
    return this.columns[columnPosition];
  }

  groupRow(groupRowId: string) : IGroupRow | undefined {
    return findGroupRowById(this.groupRows, groupRowId);
  }

  clear() {
    this.rows.set([]);
  }

  clearSelectedCells() {
    this.selectedCells.forEach(cell => cell.clear());
  }

  moveRow(rowId: string, byRows: number): boolean {
    let row = findRowById(this.rows, rowId);
    if (!row) {
      return false;
    }

    let newRowPosition = Math.max(Math.min(row.position + byRows, this.rows.length - 1), 0);
    if (newRowPosition === row.position) {
      return false;
    }

    if (row.groupRow?.id !== this.rows[newRowPosition].groupRow?.id) {
      return false;
    }

    freeze(() => {
      this.rows.splice(newRowPosition, 0, this.rows.splice(row!.position, 1)[0]);
    });

    this.setRowPositions();
    this.updateCellSelectionProperties(this.selectedCells);

    return true;
  }

  swapRows(rowId1: string, rowId2: string): boolean {
    let row1 = findRowById(this.rows, rowId1);
    if (!row1) {
      return false;
    }
    let row2 = findRowById(this.rows, rowId2);
    if (!row2) {
      return false;
    }

    if (row1.groupRow?.id !== row2.groupRow?.id) {
      return false;
    }

    freeze(() => {
      let newRow1Position = row1!.position > row2!.position ? row2!.position : row2!.position - 1;
      this.rows.splice(newRow1Position, 0, this.rows.splice(row1!.position, 1)[0]);
      let currRow2Position = row1!.position < row2!.position ? row2!.position : row2!.position + 1;
      this.rows.splice(row1!.position, 0, this.rows.splice(currRow2Position, 1)[0]);
    });

    this.setRowPositions();
    this.updateCellSelectionProperties(this.selectedCells);

    return true;
  }

  _removeRow(position: number): void {
    const row = this.rows[position];
    if (!row) return;
    this.rows.splice(position, 1);
    if (row.fixed) return;
    if (row.selected) {
      let selectedRowIdx = this.selectedRows.findIndex((selectedRow: IRow) => selectedRow.id === row.id);
      this.selectedRows.splice(selectedRowIdx, 1);
      row.selected = false;
      this.columns.forEach((column: IColumn) => {
        const cell: ICell = row.cells[column.name];
        let cellIdx = this.selectedCells.findIndex((selectedCell: ICell) => selectedCell.id === cell.id);
        if (cellIdx >= 0) {
          this.selectedCells.splice(cellIdx, 1);
          cell.unselect();
        }
      });
      this.updateCellSelectionProperties(this.selectedCells);
    }

    this.setRowPositions();
  }

  removeFixedRow(id: string): void {
    const row = findRowById(this.fixedRows, id);
    if (row) this._removeRow(row.position);
  }

  removeRow(id: string): void {
    const row = findRowById(this.rows, id);
    if (row) this._removeRow(row.position);
  }

  removeRows(ids: string[]): void {
    ids.forEach(id => { this.removeRow(id); });
  }

  removeSelectedRows(reselect: boolean = true): void {
    if (this.selectedRows.length <= 0) return;

    let newCellToSelect: ICell | undefined;
    if (reselect) {
      let currCell    = this.focusedCell || (this.selectedCells.length > 0 && this.selectedCells[this.selectedCells.length - 1]) || undefined;
      newCellToSelect = currCell ? this.findVerticallyNearestCellWithUnselectedRow(currCell) : undefined;
    }
    this.removeRows(this.selectedRows.map(row => row.id));
    if (reselect && newCellToSelect) {
      this.startCell = newCellToSelect;
      this.selectCells([newCellToSelect]);
    }
  }

  addSort(column: IColumn, sort?: SortDirection, insert?: boolean): IGrid {
    let sortColumn = this._sort.indexOf(column);
    if (sortColumn >= 0) {
      this._sort.splice(sortColumn, 1);
    }
    (column as any).sort = sort;
    if (sort) {
      if (insert) this._sort.unshift(column);
      else        this._sort.push(column);
    }
    if (this._sort.length > 0) this.sort();
    return this;
  }

  setSort(column: IColumn, sort?: SortDirection): IGrid {
    for (const c of this._sort) {
      if (c !== column) (c as any).sort = undefined;
    }
    this._sort.length = 0;
    (column as any).sort = sort;
    if (sort) this._sort.push(column);
    if (this._sort.length > 0) this.sort();
    return this;
  }

  sort() {
    if ( (!this.groupBy || !this.groupBy.length) && (!this._sort || this._sort.length === 0) ) return;
    let rowCompareFn = (r1: IRow, r2: IRow): number => {
      if (this.groupBy && this.groupBy.length) {
        for (const column of this.groupBy) {
          let compareFn = column.compare;
          let v1        = r1.cells[column.name].value;
          let v2        = r2.cells[column.name].value;
          let r         = compareFn ? compareFn(v1, v2) : compare(v1, v2);
          if (r !== 0) {
            if (!column.sort || column.sort === 'ascending') return r;
            return -1 * r;
          }
        }
      }

      for (const column of this._sort) {
        let compareFn = column.compare;
        let v1        = r1.cells[column.name].value;
        let v2        = r2.cells[column.name].value;
        let r         = compareFn ? compareFn(v1, v2) : compare(v1, v2);
        if (r !== 0) {
          if (!column.sort || column.sort === 'ascending') return r;
          return -1 * r;
        }
      }
      return 0;
    };

    this.rows.sort(rowCompareFn);

    this.setRowPositions();
    this.updateCellSelectionProperties(this.selectedCells);
  }

  sortItems(items: any[], comparer: (a: any, b: any) => number) {
    items.sort(comparer);
  }

  mergeColumns() {
    for (const row of this.fixedRows) {
      row.mergeAllColumns();
    }
    for (const row of this.rows) {
      row.mergeAllColumns();
    }
  }

  paste() {
    if (this.clipboard.length <= 0) {
      return;
    }

    let selectedCells = this.selectedCells.filter(selectedCell => !selectedCell.readOnly);
    if (selectedCells.length <= 0) {
      return;
    }

    let clipboardCellsByColumnPosition         = {};
    let clipboardCellsByColumnPositionOriginal = {};
    let clipboardValues                        = this.clipboard;
    clipboardValues.forEach(value => {
      let cellColPos = value.columnPosition;
      if (!clipboardCellsByColumnPosition[cellColPos]) {
        clipboardCellsByColumnPosition[cellColPos]         = [value];
        clipboardCellsByColumnPositionOriginal[cellColPos] = [value];
      } else {
        clipboardCellsByColumnPosition[cellColPos].push(value);
        clipboardCellsByColumnPositionOriginal[cellColPos].push(value);
      }
    });

    const rows = new Set<IRow>();

    selectedCells.forEach((selectedCell) => {
      let clipboardCellsForColumn = clipboardCellsByColumnPosition[selectedCell.columnPosition];
      if (!clipboardCellsForColumn || clipboardCellsForColumn.length <= 0) {
        return;
      }

      let clipboardValue = clipboardCellsForColumn.shift();
      selectedCell.value = clipboardValue.value;
      rows.add(selectedCell.row);


      if (clipboardCellsForColumn.length <= 0) {
        clipboardCellsByColumnPosition[selectedCell.columnPosition] = clipboardCellsByColumnPositionOriginal[selectedCell.columnPosition].slice();
      }
    });
  }

  get fixedColumns(): IColumn[] {
    return this._fixedColumns();
  }

  get standardColumns(): IColumn[] {
    return this._standardColumns();
  }

  get visibleFixedColumns(): IColumn[] {
    return this._visibleFixedColumns();
  }

  get visibleStandardColumns(): IColumn[] {
    return this._visibleStandardColumns();
  }

  get groupRows(): IGroupRow[] {
    return this._groupRows();
  }

  get groupBy(): IColumn[] {
    return this._groupColumns;
  }
  set groupBy(value: IColumn[]) {
    let groupsToMakeVisible = this._groupColumns.filter((g: IColumn) => value.findIndex((g2: IColumn) => g2.id === g.id) < 0);
    freeze(() => {
      this._groupColumns.length = 0;
      for (const column of groupsToMakeVisible) {
        column.visible = true;
      }
      for (const column of value) {
        this._groupColumns.push(column);
        column.visible = false;
      }
    });
  }

  recalculateChangeTracker() {
    this.__changeTracker && this.__changeTracker.recalculate();
  }

  _addColumn(column: IColumn): IColumn {
    column.grid     = this;
    const c: ColumnModel = (column as ColumnModel);
    if (c.__validators) this.__validator.addRule(column.name, c.__validators);
    c.__watchColumnVisible(() => c.visible, () => {
      this.mergeColumns();
    });
    c.__watchColumnFixed(() => c.fixed, () => {
      setTimeout(() => {
        this.setColumnPositions();
        this.mergeColumns();
      }, 0);
    });
    for (const row of this.rows) {
      if (!row.cells[column.name]) {
        row.createCell(column, (column as any).__getter(row.data));
      }
    }
    for (const row of this.fixedRows) {
      if (!row.cells[column.name]) {
        row.createCell(column, column.title);
      }
    }
    return column;
  }

  addFixedRow(data?: IRowData, position?: number): IRow {
    let d = data || {};
    if (d.options) {
      d.options.fixed = true;
    } else {
      d.options = {fixed: true};
    }

    return createRow(this, this.fixedRows, d, position);
  }

  mergeFixedRows() {
    mergeRows(this.fixedRows, this.fixedColumns, true);
    mergeRows(this.fixedRows, this.standardColumns, true);
  }

  addRows(data: (IRowData | undefined)[], position?: number): IRow[] {
    return this._addRows(data, position);
  }

  addRow(data?: IRowData, position?: number): IRow {
    const row = this._addRow(data, position);
    freeze(() => {
      this.sort();
      this.setRowPositions();
    });
    return row;
  }

  _addRow(data?: IRowData, position?: number): IRow {
    if (data && data.options && data.options.fixed) {
      return this.addFixedRow(data, position);
    }
    return createRow(this, this.rows, data, position);
  }

  _addRows(data: (IRowData | undefined)[], position?: number): IRow[] {
    let addedRows: IRow[] = [];
    let pos               = position;
    for (const rowData of data) {
      addedRows.push(this._addRow(rowData, pos));
      if (!isNullOrUndefined(pos)) {
        pos!++;
      }
    }

    freeze(() => {
      this.sort();
      this.setRowPositions();
    });
    return addedRows;
  }

  findVerticallyNearestCellWithUnselectedRow(cell: ICell): ICell | undefined {
    let newCellToSelect: ICell | undefined = cell;
    let currCell:        ICell | undefined = cell;
    do {
      currCell        = newCellToSelect;
      newCellToSelect = this.adjacentBottomCell(currCell, true);
    } while (newCellToSelect && newCellToSelect.row.selected);
    if (!newCellToSelect) {
      currCell        = cell;
      newCellToSelect = cell;
      do {
        currCell        = newCellToSelect;
        newCellToSelect = this.adjacentTopCell(currCell, true);
      } while (newCellToSelect && newCellToSelect.row.selected);
    }

    return newCellToSelect;
  }

  duplicateRows(ids: string[], position?: number): IRow[] {
    let duplicatedRows: IRow[] = [];
    let pos = position;
    ids.forEach(id => {
      let duplicatedRow = this._duplicateRow(id, pos);
      if (duplicatedRow) {
        duplicatedRows.push(duplicatedRow);
      }
      if (!isNullOrUndefined(pos)) {
        pos!++;
      }
    });

    freeze(() => {
      this.sort();
      this.setRowPositions();
    });
    return duplicatedRows;
  }

  duplicateRow(rowId: string, position?: number): IRow | undefined {
    const row = this._duplicateRow(rowId, position);
    if (!row) return;
    freeze(() => {
      this.sort();
      this.setRowPositions();
    });
  }

  _duplicateRow(rowId: string, position?: number): IRow | undefined {
    const row = findRowById(this.rows, rowId);
    if (!row) return;
    const rowData: IRowData = {id: guid(), data: Object.assign({}, row.data, row.data.id ? {id: guid()} : undefined), options: row.options};
    return this._addRow(rowData, position);
  }

  duplicateSelectedRows(): IRow[] {
    if (this.selectedRows.length <= 0) return [];

    return this.duplicateRows(this.selectedRows.sort(RowModel.positionCompare).map(row => row.id), Math.max(...this.selectedRows.map(row => row.position)) + 1);
  }

  insertRowAtSelection(data?: IRowData): IRow {
    let rowToInsertId      = data && data.id;
    let rowToInsertData    = data && data.data || {};
    let rowToInsertOptions = data && data.options;
    let insertPosition     = this.rows.length;
    if (this.selectedRows.length > 0) {
      this.groupBy.forEach((column: IColumn) => {
        if (isNullOrUndefined(rowToInsertData[column.name])) {
          rowToInsertData[column.name] = this.selectedRows[0].cells[column.name].value;
        }
      });
      insertPosition = Math.max(...this.selectedRows.map(row => row.position)) + 1;
    }
    let insertData: IRowData = {id: rowToInsertId, data: rowToInsertData, options: rowToInsertOptions};
    let insertedRow = this._addRow(insertData, insertPosition);
    this.setRowPositions();
    return insertedRow;
  }

  setRowPositions() {
    for (let rowIdx = 0; rowIdx < this.rows.length; rowIdx++) {
      this.rows[rowIdx].position = rowIdx;
    }
    this.recalculateChangeTracker();
  }

  setColumnPositions() {
    freeze(() => {
      let colIdx = 0;
      this.fixedColumns.forEach((column: IColumn) => {
        column.position = colIdx;
        colIdx++;
      });
      this.standardColumns.forEach((column: IColumn) => {
        column.position = colIdx;
        colIdx++;
      });
    });
    freeze(() => {
      this.columns.sort(ColumnModel.positionCompare);
    });
  }

  hasErrors(): boolean {
    for (const row of this.rows) {
      if (!row) continue;
      if (row.hasErrors()) return true;
    }
    return false;
  }

  getErrors(): IErrorData[] {
    let errors: IErrorData[] = [];

    for (const row of this.rows) {
      if (!row) continue;
      errors.concat(row.getErrors());
    }
    return errors;
  }

  validate(): void {
    for (const row of this.rows) {
      if (!row) continue;
      row.validate();
    }
  }

  selectCellByPos(rowPosition: number, columnPosition: number) {
    let cell = this.cellByPos(rowPosition, columnPosition);
    if (cell) {
      this.startCell = cell;
      this.selectCells([cell]);
    }
  }

  selectCellsByRange(rowPosition1: number, rowPosition2: number, columnPosition1: number, columnPosition2: number) {
    const rowStart = rowPosition1 < rowPosition2 ? rowPosition1 : rowPosition2;
    const rowEnd   = rowPosition2 > rowPosition1 ? rowPosition2 : rowPosition1;
    const colStart = columnPosition1 < columnPosition2 ? columnPosition1 : columnPosition2;
    const colEnd   = columnPosition2 > columnPosition1 ? columnPosition2 : columnPosition1;

    let cellsToSelect: ICell[] = [];
    for (let i = rowStart; i <= rowEnd; i++) {
      for (let j = colStart; j <= colEnd; j++) {
        let cell = this.cellByPos(i, j);
        if (cell) {
          cellsToSelect.push(cell);
        }
      }
    }
    if (cellsToSelect.length <= 0) {
      return;
    }
    this.startCell = cellsToSelect[0];
    this.selectCells(cellsToSelect, cellsToSelect[cellsToSelect.length - 1]);
  }

  selectRows(rows: IRow[]): void {
    let currentRows = this.selectedRows;

    if (currentRows.length <= 0 && rows.length <= 0) {
      return;
    }
    let currentRowsSet  = new Set(currentRows);
    let rowsSet         = new Set(rows);
    let currentRowsDiff = currentRows.filter(currRow => !rowsSet.has(currRow));
    let rowsDiff        = rows.filter(row => !currentRowsSet.has(row));

    currentRowsDiff.forEach(currRow => {
      currRow.selected = false;
    });

    rowsDiff.forEach(row => {
      row.selected = true;
    });

    freeze(() => {
      this.selectedRows.length = 0;
      this.selectedRows.push(...rows);
    });
  }

  editCell(cell?: ICell): void {
    let currentCell = this.editingCell;
    if (!cell) {
      if (!currentCell) {
        return;
      }

      currentCell.setEditing(false);
      this.editingCell = undefined;
      return;
    }

    if (cell === currentCell) {
      return;
    }

    if (currentCell) {
      currentCell.setEditing(false);
    }

    this.selectCells([cell], undefined, false);
    this.editingCell = cell;
    cell.setEditing(true);
  }

  unselectCells(cells: ICell[], cellToFocus?: ICell): void {
    let newSelectCells = this.selectedCells.slice();
    cells.forEach(cell => {
      for (let i = 0; i < cell.colSpan; i++) {
        let cellToRemove = i === 0 ? cell : this.cellByPos(cell.rowPosition, cell.columnPosition + i);
        if (!cellToRemove) {
          continue;
        }
        let cellIdx = newSelectCells.findIndex(selectCell => selectCell.id === cellToRemove!.id);
        if (cellIdx >= 0) {
          newSelectCells.splice(cellIdx, 1);
        }
      }
    });
    this.selectCells(newSelectCells, cellToFocus, false);
  }

  selectCells(cells: ICell[], cellToFocus?: ICell, handleMergedCells: boolean = true, append: boolean = false): void {
    let currentCells = this.selectedCells;

    if (currentCells.length <= 0 && cells.length <= 0) {
      this.selectedRows.length && this.selectRows([]);
      this.focusedCell && this.focusedCell.setFocus(false);
      return;
    }

    this.editCell(undefined);
    let rowsToSelect:  IRow[]  = [];
    let cellsToSelect: ICell[] = [];

    cells.forEach(cell => {
      // if (!cell.enabled || !cell.row.visible) {
      if (!cell.row.visible) {
        return;
      }
      if (cell.canSelect) {
        cell.selected = true;
      }
      rowsToSelect.push(cell.row);
      if (cell.canSelect) {
        cellsToSelect.push(cell);

        if (handleMergedCells) {
          for (let i = 1; i < cell.colSpan; i++) {
            let additionalCell = this.cellByPos(cell.rowPosition, cell.columnPosition + i);
            if (!additionalCell) {
              continue;
            }
            additionalCell.selected = true;
            cellsToSelect.push(additionalCell);
          }
        }
      }
    });

    let currentCellsDiff = currentCells.filter(currCell => !cellsToSelect.includes(currCell));

    if (append) {
      rowsToSelect  = rowsToSelect.concat(this.selectedRows);
      cellsToSelect = cellsToSelect.concat(currentCellsDiff);
      cellsToSelect.sort(CellModel.positionCompare);
    } else {
      currentCellsDiff.forEach(currentCell => {
        currentCell.unselect();
      });
    }

    this.updateCellSelectionProperties(cellsToSelect);
    this.selectRows([...new Set(rowsToSelect)]);
    this.selectedCells.set(...cellsToSelect);
    if (this.selectedCells.length <= 0) {
      this.focusedCell && this.focusedCell.setFocus(false);
      return;
    }

    let cToFocus: ICell | undefined = cellToFocus ? cellToFocus : cellsToSelect[cellsToSelect.length - 1];

    // if a merged cell, need to focus previous one, as current is hidden.
    while (cToFocus && cToFocus.colSpan <= 0) {
      cToFocus = this.previousCell(cToFocus, true);
      }
    if (cToFocus) {
      cToFocus.setFocus();
    }
  }

  updateCellSelectionProperties(cellsToSelect: ICell[]) {
    cellsToSelect.forEach(cell => {
      freeze(() => {
        let adjacentTopCell = this.adjacentTopCell(cell);
        let sameGroupTop    = !!adjacentTopCell && true; // (adjacentTopCell.row.parentRow && adjacentTopCell.row.parentRow.id) === (cell.row.parentRow && cell.row.parentRow.id);
        if (!adjacentTopCell || !sameGroupTop || !adjacentTopCell.selected) {
          cell.isTopMostSelection = true;
        } else {
          cell.isTopMostSelection = false;
        }

        let adjacentRightCell = this.adjacentRightCell(cell);
        if (!adjacentRightCell || !adjacentRightCell.selected) {
          cell.isRightMostSelection = true;
        } else {
          cell.isRightMostSelection = false;
        }

        let adjacentBottomCell = this.adjacentBottomCell(cell);
        let sameGroupBottom    = !!adjacentBottomCell && true; // (adjacentBottomCell.row.parentRow && adjacentBottomCell.row.parentRow.id) === (cell.row.parentRow && cell.row.parentRow.id);
        if (!adjacentBottomCell || !sameGroupBottom || !adjacentBottomCell.selected) {
          cell.isBottomMostSelection = true;
        } else {
          cell.isBottomMostSelection = false;
        }

        let adjacentLeftCell = this.adjacentLeftCell(cell);
        if (!adjacentLeftCell || !adjacentLeftCell.selected) {
          cell.isLeftMostSelection = true;
        } else {
          cell.isLeftMostSelection = false;
        }
      });
    });
  }

  selectCellsTo(cell: ICell, append: boolean = false) {
    let rowPos      = cell.rowPosition;
    let colPos      = cell.columnPosition;
    let startRowPos = this.startCell!.rowPosition;
    let startColPos = this.startCell!.columnPosition;
    let rowStart: number;
    let rowEnd: number;
    let colStart: number;
    let colEnd: number;

    if (rowPos < startRowPos) {
        rowStart = rowPos;
        rowEnd   = startRowPos;
    } else {
        rowStart = startRowPos;
        rowEnd   = rowPos;
    }

    if (colPos < startColPos) {
        colStart = colPos;
        colEnd   = startColPos;
    } else {
        colStart = startColPos;
        colEnd   = colPos;
    }

    let columnsToSelect: IColumn[] = [];
    for (let i = colStart; i <= colEnd; i++) {
      let column = this.columnByPos(i);
      if (column && column.visible) {
        columnsToSelect.push(column);
      }
    }

    if (append) {
      columnsToSelect = [...new Set(columnsToSelect.concat(this.selectedCells.map(cell => cell.column)))];
      columnsToSelect.sort(ColumnModel.positionCompare);
    }

    let rowsToSelect = this.getRowsByRange(rowStart, rowEnd, false);
    if (append) {
      rowsToSelect = [...new Set(rowsToSelect.concat(this.selectedRows))];
    }

    // handle merged cells case
    columnsToSelect = this.selectCellsToMergeHelper(rowsToSelect.filter(row => row.allowMergeColumns), columnsToSelect);

    let cellsToSelect: ICell[] = [];
    rowsToSelect.forEach(row => {
      columnsToSelect.forEach(column => {
        let cell = row.cells[column.name];
        if (cell) {
          cellsToSelect.push(cell);
        }
      });
    });

    // if (append) {
    //   cellsToSelect = [...new Set(cellsToSelect.concat(this.selectedCells))];
    // }

    // cellsToSelect.sort(CellModel.positionCompare);
    const cellToFocus = cell.canSelect ? cell : undefined;
    this.selectCells(cellsToSelect, cellToFocus, false, append);
  }

  private selectCellsToMergeHelper(rows: IRow[], columnsToSelect: IColumn[]): IColumn[] {
    rows.forEach((row, idx) => {
      if (!row.allowMergeColumns) return;
      let colToSelectCount = columnsToSelect.length;
      let rowCells         = columnsToSelect.map(column => row.cells[column.name]);
      rowCells.forEach(rowCell => {
        if (rowCell.colSpan === 1 || !columnsToSelect.some(col => col.id === rowCell.column.id)) {
          return;
        }

        if (rowCell.colSpan > 1) {
          for (let i = 1; i < rowCell.colSpan && rowCell.columnPosition + i < this.columns.length; i++) {
            columnsToSelect.push(this.columns[rowCell.columnPosition + i]);
          }
        } else if (rowCell.colSpan === 0) {
          let prevCell: ICell | undefined = rowCell;
          let nextCell: ICell | undefined = rowCell;
          do {
            prevCell = this.cellByPos(prevCell.rowPosition, prevCell.columnPosition - 1);
            if (prevCell) {
              columnsToSelect.push(prevCell.column);
            }
          } while (prevCell && prevCell.colSpan === 0);
          do {
            nextCell = this.cellByPos(nextCell.rowPosition, nextCell.columnPosition + 1);
            if (nextCell && nextCell.colSpan === 0) {
              columnsToSelect.push(nextCell.column);
            }
          } while (nextCell && nextCell.colSpan === 0);
        }

        columnsToSelect = [...new Set(columnsToSelect)];
      });
      if (columnsToSelect.length > colToSelectCount) {
        // columns added, need to check previous rows to see if the cells of these new columns are themselves merged cells
        let prevRowsNewColumnsToSelect = this.selectCellsToMergeHelper(rows.slice(0, idx), columnsToSelect.slice(colToSelectCount, columnsToSelect.length));
        columnsToSelect                = [...new Set(columnsToSelect.concat(prevRowsNewColumnsToSelect))];
      }
    });

    return columnsToSelect;
  }

  clearSelection() {
    this.startCell = undefined;
    this.editCell(undefined);
    this.selectCells([]);
  }

  spliceColumns(start: number, deleteCount: number, ...columns: IColumn[]): void {
    if (deleteCount <= 0 && !columns?.length) {
      return;
    }
    const columnsToAdd: any[] = [];
    for (let colIdx = 0; colIdx < this.columns.length; colIdx++) {
      const column = this.columns[colIdx];
      column.position = colIdx < start ? colIdx : start + colIdx + columns.length;
    }

    for (let colIdx = 0; colIdx < columns.length; colIdx++) {
      const column = columns[colIdx];
      const idx    = this.columns.findIndex(c => c.name === column.name);
      if ((idx >= 0) && !((idx >= start) && (idx < (start + deleteCount)))) continue;
      const newColumn    = this._addColumn(column);
      newColumn.position = colIdx + start;
      columnsToAdd.push(newColumn);
    }
    this.columns.splice(start, deleteCount, ...columnsToAdd);
    this.mergeColumns();
    this.mergeFixedRows();
  }

  static create(rows: any[], columns: IColumn[], options?: IGridOptions): IGrid {
    return root((dispose: any) => {
      let grid     = observable(new GridModel());
      grid.initialize(dispose, options);
      grid.loading = true;
      freeze(() => {
        let groupBy  = options && options.groupBy;
        if (groupBy) {
          grid.groupBy = groupBy.map((name: string) => findColumnByName(columns, name)).filter((column: IColumn | undefined) => !isNullOrUndefined(column)) as IColumn[];
        }
      });
      freeze(() => {
        grid.addFixedRow({data: {}});
        grid.spliceColumns(0, 0, ...columns);
      });
      freeze(() => {
        grid._addRows(rows);
      });
      grid.optionsMenu = options && options.optionsMenuFn && options.optionsMenuFn();
      grid.loading     = false;
      grid.validate();
      grid.mergeColumns();
      return grid;
    });
  }
}

export function mergeRows(rows: IRow[], columns: IColumn[], mergeEmpty: boolean = false): void {
  for (const column of columns) {
    let previousValue: any;
    let previousCell: ICell | undefined;
    let rowSpan = 1;
    for (const r of rows) {
      let cell = r.cells[column.name];
      if (previousCell && cell && (previousValue === cell.value || (!cell.value && mergeEmpty))) {
        previousCell.rowSpan = ++rowSpan;
        cell.rowSpan = 0;
        continue;
      }
      previousCell  = cell;
      previousValue = cell.value;
    }
  }
}

export default GridModel.create;
