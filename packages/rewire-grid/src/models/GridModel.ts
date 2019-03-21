import {
  IGrid,
  ICell,
  IRow,
  IColumn,
  IErrorData,
  SortDirection,
  groupRows,
  findColumnByName,
  findColumnByPosition,
  fixedRows,
  allDataRows,
  allRows,
  IRowIteratorResult,
  IDisposable,
  findRowById,
  cloneValue,
  IGridOptions,
  VerticalAlignment,
  IGridRowKeybindPermissions,
  IGridStaticKeybinds,
  IGridVariableKeybinds,
  ICellDataMap,
  IRowOptions,
  IRowData,
}                              from './GridTypes';
import createRow               from './RowModel';
import {ColumnModel}           from './ColumnModel';
import {CellModel}             from './CellModel';
import {
  gridStaticKeybinds,
  gridDefaultVariableKeybinds
}                              from './GridKeybinds';
import * as merge              from 'deepmerge';
import {
  observable,
  computed,
  observe,
  property,
  freeze,
  root,
  DataSignal,
}                  from 'rewire-core';
import { compare } from 'rewire-ui';

let id = 0;
class GridModel implements IGrid, IDisposable {
  _contentElement           : DataSignal<HTMLDivElement | undefined>;
  _standardColumns          : () => IColumn[];
  _fixedColumns             : () => IColumn[];
  _sort                     : IColumn[];
  id                        : number;
  enabled                   : boolean;
  readOnly                  : boolean;
  verticalAlign             : VerticalAlignment;
  addedRows                 : IRowIteratorResult[];
  removedRows               : IRowIteratorResult[];
  rows                      : IRow[];
  fixedRows                 : IRow[];
  columns                   : IColumn[];
  dataRowsByPosition        : IRow[];
  originalDataRowsByPosition: IRow[];
  editingCell?              : ICell;
  selectedRows              : IRow[];
  selectedCells             : ICell[];
  focusedCell?              : ICell;
  fixedWidth                : string;
  loading                   : boolean;
  isDraggable               : boolean;
  clipboard                 : ICell[];
  multiSelect               : boolean;
  allowMergeColumns         : boolean;
  isMouseDown               : boolean;
  clearSelectionOnBlur      : boolean;
  rowKeybindPermissions     : IGridRowKeybindPermissions;
  staticKeybinds            : IGridStaticKeybinds;
  variableKeybinds          : IGridVariableKeybinds;
  startCell?                : ICell;
  changed                   : boolean;
  inError                   : boolean;

  private _dispose: () => void;

  constructor(options?: IGridOptions) {
    this._contentElement            = property(undefined);
    this._sort                      = [];
    this.id                         = id++;
    this.addedRows                  = [];
    this.removedRows                = [];
    this.rows                       = [];
    this.fixedRows                  = [];
    this.columns                    = [];
    this.dataRowsByPosition         = [];
    this.originalDataRowsByPosition = [];
    this.editingCell                = undefined;
    this.selectedRows               = [];
    this.selectedCells              = [];
    this.focusedCell                = undefined;
    this.fixedWidth                 = '1px';
    this.loading                    = false;
    this.enabled                    = options && options.enabled !== undefined ? options.enabled : true;
    this.readOnly                   = options && options.readOnly !== undefined ? options.readOnly : false;
    this.verticalAlign              = options && options.verticalAlign || 'middle';
    this.isDraggable                = options && options.isDraggable !== undefined ? options.isDraggable : false;
    this.multiSelect                = options && options.multiSelect !== undefined ? options.multiSelect : false;
    this.allowMergeColumns          = options && options.allowMergeColumns !== undefined ? options.allowMergeColumns : false;
    this.clearSelectionOnBlur       = options && options.clearSelectionOnBlur !== undefined ? options.clearSelectionOnBlur : true;
    this.clipboard                  = [];
    this.isMouseDown                = false;
    this.startCell                  = undefined;
    this.changed                    = false;
    this.inError                    = false;

    this.rowKeybindPermissions = {
      insertRow:    options && options.rowKeybindPermissions && options.rowKeybindPermissions.insertRow !== undefined ? options.rowKeybindPermissions.insertRow : true,
      duplicateRow: options && options.rowKeybindPermissions && options.rowKeybindPermissions.duplicateRow !== undefined ? options.rowKeybindPermissions.duplicateRow : true,
      deleteRow:    options && options.rowKeybindPermissions && options.rowKeybindPermissions.deleteRow !== undefined ? options.rowKeybindPermissions.deleteRow : true,
    };

    this.staticKeybinds   = Object.assign({}, gridStaticKeybinds);
    this.variableKeybinds = merge(gridDefaultVariableKeybinds, options && options.variableKeybinds || {}) as IGridVariableKeybinds;
  }

  setContentElement(element: HTMLDivElement | undefined) {
    this._contentElement(element);
  }
  get contentElement(): HTMLDivElement | undefined {
    return this._contentElement();
  }

  initialize(dispose: () => void) {
    if (this.rows && (this.rows.length > 0)) {
      this.selectedRows = [this.rows[0]];
    }

    this._dispose      = dispose;
    const columns         = observe(() => {this.columns.length; this.columns.map((column: IColumn) => column.fixed); });
    this._fixedColumns = computed(columns, () => this.columns.filter((h) => h.fixed), []);
    this._standardColumns = computed(columns, () => this.columns.filter((h) => !h.fixed), []);
  }

  private disposeRows() {
    for (const row of this.rows) {
      row.dispose();
    }

    for (const row of this.removedRows) {
      row.row.dispose();
    }
  }

  dispose() {
    this.disposeRows();
    if (this._dispose) this._dispose();
  }

  copy() {
    let selectedCells = this.selectedCells;
    if (selectedCells.length <= 0) {
      return;
    }

    let copiedCells: ICell[] = [];
    selectedCells.forEach(cell => {
      copiedCells.push(cell.clone(cell.row));
    });
    this.clipboard = copiedCells;
  }

  cut() {
    this.copy();
    this.selectedCells.forEach(cell => cell.clear());
  }

  get(): ICellDataMap[] {
    const data: ICellDataMap[] = [];
    for (const row of allDataRows(this.rows)) {
      let rowData: ICellDataMap = {};
      for (const column of this.columns) {
        rowData[column.name] = row.row.cells[column.name].value;
      }
      data.push(rowData);
    }
    return data;
  }

  getChanges(): ICellDataMap[] {
    const data: ICellDataMap[] = [];
    for (const row of allDataRows(this.rows)) {
      let rowData: ICellDataMap = {};
      for (const column of this.columns) {
        let cell = row.row.cells[column.name];
        if (cell.hasChanges()) {
          rowData[column.name] = cell.value;
        }
      }
      if (Object.keys(rowData).length > 0) {
        data.push(rowData);
      }
    }
    return data;
  }

  set(data: (IRowData | undefined)[]): void {
    this.disposeRows();
    freeze(() => {
      this.addedRows.length                  = 0;
      this.removedRows.length                = 0;
      this.rows.length                       = 0;
      this.dataRowsByPosition.length         = 0;
      this.originalDataRowsByPosition.length = 0;
      this.selectedRows.length               = 0;
      this.selectedCells.length              = 0;
      this._addRows(data);
    });
  }

  getCellsByRange(colStart: number, rowStart: number, colEnd: number, rowEnd: number, allowCollapsed: boolean): ICell[] {
    let cells: ICell[] = [];
    let rows = this.getRowsByRange(rowStart, rowEnd, allowCollapsed);
    rows.forEach(row => {
      let rowCells = row.cellsByColumnPosition;
      for (let j = colStart; j <= colEnd; j++) {
        let cellToAdd = rowCells[j];
        if (!cellToAdd.column.visible || cellToAdd.rowSpan <= 0) {
          continue;
        }

        cells.push(cellToAdd);
      }
    });

    return cells;
  }

  getRowsByRange(rowStart: number, rowEnd: number, allowCollapsed: boolean): IRow[] {
    let rows: IRow[] = [];
    let rowCount     = this.dataRowsByPosition.length;
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
    if (rowPosition < 0 || rowPosition >= this.dataRowsByPosition.length) {
      return undefined;
    }

    const rowCells = this.dataRowsByPosition[rowPosition].cellsByColumnPosition;
    if (columnPosition < 0 || columnPosition >= rowCells.length) {
      return undefined;
    }

    const cell = rowCells && rowCells[columnPosition];
    if (!cell) return undefined;
    return cell;
  }

  adjacentTopCell(cell: ICell, onlySelectable: boolean = false): ICell | undefined {
    let adjacentTopCell: ICell | undefined;
    let i = 1;
    do {
      adjacentTopCell = this.cellByPos(cell.rowPosition - i++, cell.columnPosition);
    } while (onlySelectable && adjacentTopCell && (!adjacentTopCell.row.visible || !adjacentTopCell.enabled || !adjacentTopCell.column.visible));

    if (adjacentTopCell && adjacentTopCell.colSpan === 0) {
      adjacentTopCell = this.adjacentLeftCell(adjacentTopCell, onlySelectable);
    }

    return adjacentTopCell;
  }

  adjacentRightCell(cell: ICell, onlySelectable: boolean = false): ICell | undefined {
    let adjacentRightCell: ICell | undefined;
    let i = 1;
    do {
      adjacentRightCell = this.cellByPos(cell.rowPosition, cell.columnPosition + i++);
    } while (adjacentRightCell && (!adjacentRightCell.column.visible || adjacentRightCell.colSpan === 0 || (onlySelectable && !adjacentRightCell.enabled)));

    return adjacentRightCell;
  }

  adjacentBottomCell(cell: ICell, onlySelectable: boolean = false): ICell | undefined {
    let adjacentBottomCell: ICell | undefined;
    let i = 1;
    do {
      adjacentBottomCell = this.cellByPos(cell.rowPosition + i++, cell.columnPosition);
    } while (onlySelectable && adjacentBottomCell && (!adjacentBottomCell.row.visible || !adjacentBottomCell.enabled || !adjacentBottomCell.column.visible));

    if (adjacentBottomCell && adjacentBottomCell.colSpan === 0) {
      adjacentBottomCell = this.adjacentLeftCell(adjacentBottomCell, onlySelectable);
    }

    return adjacentBottomCell;
  }

  adjacentLeftCell(cell: ICell, onlySelectable: boolean = false): ICell | undefined {
    let adjacentLeftCell: ICell | undefined;
    let i = 1;
    do {
      adjacentLeftCell = this.cellByPos(cell.rowPosition, cell.columnPosition - i++);
    } while (adjacentLeftCell && (!adjacentLeftCell.column.visible || adjacentLeftCell.colSpan === 0 || (onlySelectable && !adjacentLeftCell.enabled)));

    return adjacentLeftCell;
  }

  nextCell(cell: ICell, onlySelectable: boolean = false): ICell | undefined {
    let nextCell = this.adjacentRightCell(cell, onlySelectable);
    if (!nextCell) {
      nextCell = this.cellByPos(cell.rowPosition + 1, 0);
      if (nextCell && (!nextCell.column.visible || nextCell.colSpan === 0 || (onlySelectable && !nextCell.enabled))) {
        nextCell = this.adjacentRightCell(nextCell, onlySelectable);
      }
    }

    return nextCell;
  }

  previousCell(cell: ICell, onlySelectable: boolean = false): ICell | undefined {
    let prevCell = this.adjacentLeftCell(cell, onlySelectable);
    if (!prevCell) {
      let prevRow = this.rowByPos(cell.rowPosition - 1);
      prevCell    = prevRow && this.cellByPos(prevRow.position, prevRow.cellsByColumnPosition.length - 1);
      if (prevCell && (!prevCell.column.visible || prevCell.colSpan === 0 || (onlySelectable && !prevCell.enabled))) {
        prevCell = this.adjacentLeftCell(prevCell, onlySelectable);
      }
    }

    return prevCell;
  }

  firstCell(onlySelectable: boolean = false): ICell | undefined {
    let firstCell = this.cellByPos(0, 0);
    if (firstCell && (!firstCell.column.visible || firstCell.colSpan === 0 || (onlySelectable && !firstCell.enabled))) {
      firstCell = this.nextCell(firstCell, true);
    }

    return firstCell;
  }

  lastCell(onlySelectable: boolean = false): ICell | undefined {
    let lastCell = this.cellByPos(this.dataRowsByPosition.length - 1, this.columns.length - 1);
    if (lastCell && (!lastCell.column.visible || lastCell.colSpan === 0 || (onlySelectable && !lastCell.enabled))) {
      lastCell = this.previousCell(lastCell, true);
    }

    return lastCell;
  }

  firstCellInRow(row: IRow, onlySelectable: boolean = false): ICell | undefined {
    let firstCellInRow = this.cellByPos(row.position, 0);
    if (firstCellInRow && (!firstCellInRow.column.visible || firstCellInRow.colSpan === 0 || (onlySelectable && !firstCellInRow.enabled))) {
      firstCellInRow = this.adjacentRightCell(firstCellInRow, true);
    }

    return firstCellInRow;
  }

  lastCellInRow(row: IRow, onlySelectable: boolean = false): ICell | undefined {
    let lastCellInRow = this.cellByPos(row.position, this.columns.length - 1);
    if (lastCellInRow && (!lastCellInRow.column.visible || lastCellInRow.colSpan === 0 || (onlySelectable && !lastCellInRow.enabled))) {
      lastCellInRow = this.adjacentLeftCell(lastCellInRow, true);
    }

    return lastCellInRow;
  }

  row(rowId: string): IRow | undefined {
    const row = findRowById(allDataRows(this.rows), rowId);
    if (!row) return undefined;
    return row.row;
  }

  rowByPos(rowPosition: number): IRow | undefined {
    if (rowPosition < 0 || rowPosition >= this.dataRowsByPosition.length) {
      return undefined;
    }

    const row = this.dataRowsByPosition[rowPosition];
    if (!row) return undefined;
    return row;
  }

  column(columnName: string): IColumn | undefined {
    const column = findColumnByName(this.columns, columnName);
    if (!column) return undefined;
    return column;
  }

  columnByPos(columnPosition: number): IColumn | undefined {
    const column = findColumnByPosition(this.columns, columnPosition);
    if (!column) return undefined;
    return column;
  }

  adjacentRightColumn(column: IColumn): IColumn | undefined {
    let adjacentRightColumn: IColumn | undefined;
    let i = 1;
    do {
      adjacentRightColumn = this.columnByPos(column.position + i++);
    } while (adjacentRightColumn && (!adjacentRightColumn.visible || adjacentRightColumn.colSpan === 0));

    return adjacentRightColumn;
  }

  adjacentLeftColumn(column: IColumn): IColumn | undefined {
    let adjacentLeftColumn: IColumn | undefined;
    let i = 1;
    do {
      adjacentLeftColumn = this.columnByPos(column.position - i++);
    } while (adjacentLeftColumn && (!adjacentLeftColumn.visible || adjacentLeftColumn.colSpan === 0));

    return adjacentLeftColumn;
  }

  revert(): void {
    freeze(() => {
      let originalDataRowIds = this.originalDataRowsByPosition.map(row => row.id);
      if (this.removedRows) {
        for (const removedRow of this.removedRows) {
          if (!originalDataRowIds.includes(removedRow.row.id)) {
            continue;
          }
          removedRow.rows.splice(removedRow.idx, 0, removedRow.row);
          this.dataRowsByPosition.splice(removedRow.row.position, 0, removedRow.row);
          // *** TODO get revert of group row removal (add them back) working.
          // let parentRow = removedRow.row.parentRow;
          // if (!parentRow) {
          //   continue;
          // }
          // let grandparentRow = parentRow.parentRow;
          // while (grandparentRow) {
          //   if (grandparentRow.rows.find((row: IRow) => row.id === parentRow!.id)) break;
          //   grandparentRow.rows.push(parentRow);
          //   parentRow      = grandparentRow;
          //   grandparentRow = grandparentRow.parentRow;
          // }

          // if (this.rows.find((row: IRow) => row.id === parentRow!.id)) continue;
          // this.rows.push(parentRow);
        }
        this.removedRows.length = 0;
      }

      if (this.addedRows) {
        // remove added rows
        for (const addedRow of this.addedRows) {
          if (originalDataRowIds.includes(addedRow.row.id)) {
            continue;
          }
          let idx: number;
          idx = addedRow.rows.findIndex(row => row.id === addedRow.row.id);
          if (idx >= 0) addedRow.rows.splice(idx, 1);
          idx = this.dataRowsByPosition.findIndex(row => row.id === addedRow.row.id);
          if (idx >= 0) this.dataRowsByPosition.splice(idx, 1);
          if (addedRow.row.parentRow && addedRow.rows.length <= 0) {
            this._removeGroupRow(groupRows(this.rows), addedRow.row.parentRow.id);
          }
        }
        this.addedRows.length = 0;
      }
    });
      this.dataRowsByPosition.forEach(row => {
      row._revert();
    });
    this.validate();
    this.mergeColumns();
    this.changed = this.hasChanges();
    this.sort();
    if (this.focusedCell) {
      this.focusedCell.setFocus();
    }
  }

  revertSelectedCells() {
    if (this.selectedCells.length <= 0) return;

    this.selectedCells.forEach((selectedCell: ICell) => {
      selectedCell._revert();
      });

    let selectedColumnNames = [...new Set(this.selectedCells.map((cell: ICell) => cell.column.name))];
    this.selectedRows.forEach((selectedRow: IRow) => {
      selectedRow.validate(selectedColumnNames);
      selectedRow.mergeAllColumns();
    });
    this.changed = this.hasChanges();
  }

  revertSelectedRows() {
    if (this.selectedRows.length <= 0) return;

    this.selectedRows.forEach((selectedRow: IRow) => {
      selectedRow._revert();
      selectedRow.validate();
      selectedRow.mergeAllColumns();
    });
    this.changed = this.hasChanges();
  }

  clear() {
    this.dataRowsByPosition.forEach((row: IRow) => {
      row.clear();
    });
  }

  clearSelectedCells() {
    this.selectedCells.forEach(cell => cell.clear());
  }

  _removeGroupRow(iterator: IterableIterator<IRowIteratorResult>, id: string): void {
    const groupRow = findRowById(iterator, id);
    if (!groupRow) return;
    groupRow.rows.splice(groupRow.idx, 1);
    if (groupRow.row.parentRow && groupRow.rows.length <= 0) {
      this._removeGroupRow(groupRows(this.rows), groupRow.row.parentRow.id);
    }
  }

  _removeRow(iterator: IterableIterator<IRowIteratorResult>, id: string): void {
    const row = findRowById(iterator, id);
    if (!row) return;
    row.rows.splice(row.idx, 1);
    if (row.row.fixed) return;
    this.removedRows.push(row);
    // *** TODO use this code to remove group rows if they are empty, once the revert is working
    // if (row.row.parentRow && row.rows.length <= 0) {
    //   this._removeGroupRow(groupRows(this.rows), row.row.parentRow.id);
    // }

    // unselect the row + any cells that are a part of the removed row.
    if (row.row.selected) {
      let selectedRowIdx = this.selectedRows.findIndex((selectedRow: IRow) => selectedRow.id === row.row.id);
      this.selectedRows.splice(selectedRowIdx, 1);
      row.row.selected = false;
      row.row.cellsByColumnPosition.forEach((cell: ICell) => {
        let cellIdx = this.selectedCells.findIndex((selectedCell: ICell) => selectedCell.id === cell.id);
        if (cellIdx >= 0) {
          this.selectedCells.splice(cellIdx, 1);
          cell.unselect();
        }
      });
      this.updateCellSelectionProperties(this.selectedCells);
    }

    this.dataRowsByPosition.splice(row.row.position, 1);
    this.setRowPositions();
  }

  removeFixedRow(id: string): void {
    this._removeRow(fixedRows(this), id);
  }

  removeRow(id: string): void {
    this._removeRow(allDataRows(this.rows), id);
  }

  removeRows(ids: string[]): void {
    ids.forEach(id => {
      this.removeRow(id);
    });
  }

  removeSelectedRows(reselect: boolean = true): void {
    if (this.selectedRows.length <= 0) return;

    let newCellToSelect: ICell | undefined;
    if (reselect) {
      let currCell    = this.focusedCell || (this.selectedCells.length > 0 && this.selectedCells[this.selectedCells.length - 1]) || undefined;
      newCellToSelect = currCell ? currCell.findVerticallyNearestCellWithUnselectedRow() : undefined;
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
    let rowCompareFn = (r1: IRow, r2: IRow): number => {
      for (const column of this._sort) {
        let compareFn = column.compare;
        let v1 = r1.cells[column.name].value;
        let v2 = r2.cells[column.name].value;
        let r  = compareFn ? compareFn(v1, v2) : compare(v1, v2);
        if (r !== 0) {
          if (column.sort === 'ascending') return r;
          return -1 * r;
        }
      }
      return 0;
    };

    if (this.groupBy.length > 0) {
      for (let rows of groupRows(this.rows)) {
        rows.row.rows.sort(rowCompareFn);
      }
    } else {
      this.rows.sort(rowCompareFn);
    }

    // recalibrate row positions and recalculate selection flags
    let newDataRowsByPosition: IRow[] = [];
    let totalRowCount                 = 0;
    for (const rows of allDataRows(this.rows)) {
      rows.row.position = totalRowCount;
      newDataRowsByPosition.push(rows.row);
      Object.values(rows.row.cells).forEach(cell => {
        cell.row.position = totalRowCount; // cell row and grid row different objects for some reason
        // console.log(rows.row.position);
        // console.log(cell.row.position);
        // console.log(cell.rowPosition);
        // console.log('***********************');
      });
      totalRowCount++;
    }

    freeze(() => {
      this.dataRowsByPosition.length = 0;
      this.dataRowsByPosition.push(...newDataRowsByPosition);
    });
    this.updateCellSelectionProperties(this.selectedCells);
  }

  sortItems(items: any[], comparer: (a: any, b: any) => number) {
    items.sort(comparer);
  }

  mergeColumns() {
    for (const row of fixedRows(this)) {
      row.row.mergeAllColumns();
    }
    for (const row of allRows(this.rows)) {
      row.row.mergeAllColumns();
    }
  }

  paste() {
    if (this.clipboard.length <= 0) {
      return;
    }

    let selectedCells = this.selectedCells.filter(selectedCell => !selectedCell.readOnly && selectedCell.enabled);
    if (selectedCells.length <= 0) {
      return;
    }

    let clipboardCellsByColumnPosition         = {};
    let clipboardCellsByColumnPositionOriginal = {};
    let clipboardCells                         = this.clipboard;
    clipboardCells.forEach(cell => {
      let cellColPos = cell.columnPosition;
      if (!clipboardCellsByColumnPosition[cellColPos]) {
        clipboardCellsByColumnPosition[cellColPos]         = [cell];
        clipboardCellsByColumnPositionOriginal[cellColPos] = [cell];
      } else {
        clipboardCellsByColumnPosition[cellColPos].push(cell);
        clipboardCellsByColumnPositionOriginal[cellColPos].push(cell);
      }
    });

    selectedCells.forEach((selectedCell) => {
      let clipboardCellsForColumn = clipboardCellsByColumnPosition[selectedCell.columnPosition];
      if (!clipboardCellsForColumn || clipboardCellsForColumn.length <= 0) {
        return;
      }

      let clipboardCell = clipboardCellsForColumn.shift();
      selectedCell.setValue(cloneValue(clipboardCell.value));

      if (clipboardCellsForColumn.length <= 0) {
        clipboardCellsByColumnPosition[selectedCell.columnPosition] = clipboardCellsByColumnPositionOriginal[selectedCell.columnPosition].slice();
      }
    });
  }

  get fixedColumns() {
    return this._fixedColumns();
  }

  get standardColumns() {
    return this._standardColumns();
  }

  _groups: IColumn[] = [];
  get groupBy(): IColumn[] {
    return this._groups;
  }
  set groupBy(value: IColumn[]) {
    this._groups.length = 0;
    for (const column of value) {
      this._groups.push(column);
      column.visible = false;
    }
  }

  addColumn(column: IColumn): IColumn {
    column.grid     = this;
    column.position = this.columns.length;
    this.columns.push(column);
    return column;
  }

  addRow(data?: IRowData, position?: number): IRow {
    let newRow = this._addRow(data, position);

    this.setRowPositions();

    const addedRow = findRowById(allDataRows(this.rows), newRow.id);
    if (addedRow) {
      this.addedRows.push(addedRow);
    }

    return newRow;
  }

  _addRow(data?: IRowData, position?: number): IRow {
    if (data && data.options && data.options.fixed) {
      return this.addFixedRow(data, position);
    }
    return createRow(this, this.rows, data, position);
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
    let addedRows = this._addRows(data, position);
    for (const addedRow of addedRows) {
      const row = findRowById(allDataRows(this.rows), addedRow.id);
      if (row) {
        this.addedRows.push(row);
      }
    }

    return addedRows;
  }

  _addRows(data: (IRowData | undefined)[], position?: number): IRow[] {
    let addedRows: IRow[] = [];
    let pos               = position;
    for (const rowData of data) {
      addedRows.push(this._addRow(rowData, pos));
      if (pos !== undefined) {
        pos++;
      }
    }

    this.setRowPositions();

    return addedRows;
  }

  _duplicateRow(iterator: IterableIterator<IRowIteratorResult>, id: string, position?: number): IRow | undefined {
    const row = findRowById(iterator, id);
    if (!row) return;
    let newRow = row.row.clone();
    let rowCellDataMap: ICellDataMap = {};
    Object.keys(newRow.cells).forEach(columnName => {
      rowCellDataMap[columnName] = newRow.cells[columnName].value;
    });
    let options: IRowOptions = {
      cls: newRow.cls,
      visible: newRow.visible,
      fixed: newRow.fixed,
      allowMergeColumns: newRow.allowMergeColumns,
    };

    let data: IRowData = {data: rowCellDataMap, options: options};
    return this.addRow(data, position);
  }

  duplicateRow(id: string, position?: number): IRow | undefined {
    return this._duplicateRow(allDataRows(this.rows), id, position);
  }

  duplicateRows(ids: string[], position?: number): IRow[] {
    let duplicatedRows: IRow[] = [];
    let pos = position;
    ids.forEach(id => {
      let duplicatedRow = this.duplicateRow(id, pos);
      if (duplicatedRow) {
        duplicatedRows.push(duplicatedRow);
      }
      if (pos !== undefined) {
        pos++;
      }
    });

    return duplicatedRows;
  }

  duplicateSelectedRows(): IRow[] {
    if (this.selectedRows.length <= 0) return [];

    return this.duplicateRows(this.selectedRows.map(row => row.id), Math.max(...this.selectedRows.map(row => row.position)) + 1);
  }

  insertRowAtSelection(data?: IRowData): IRow {
    let rowToInsertId      = data && data.id;
    let rowToInsertData    = data && data.data || {};
    let rowToInsertOptions = data && data.options;
    let insertPosition     = this.dataRowsByPosition.length;
    if (this.selectedRows.length > 0) {
    this.groupBy.forEach((column: IColumn) => {
        if (rowToInsertData[column.name] === undefined) {
          rowToInsertData[column.name] = this.selectedRows[0].cells[column.name].value;
      }
    });
      insertPosition = Math.max(...this.selectedRows.map(row => row.position)) + 1;
    }
    let insertData: IRowData = {id: rowToInsertId, data: rowToInsertData, options: rowToInsertOptions};
    return this.addRow(insertData, insertPosition);
  }

  setRowPositions() {
    let totalRowCount = 0;
    for (const rows of allDataRows(this.rows)) {
      rows.row.position = totalRowCount;
      Object.values(rows.row.cells).forEach(cell => { // won't need to do this once the row references bug is fixed.
        cell.row.position = totalRowCount; // cell row and grid row different objects for some reason
      });
      totalRowCount++;
    }
  }

  hasChanges(): boolean {
    let dataRowsIds         = this.dataRowsByPosition.map(row => row.id);
    let originalDataRowsIds = this.originalDataRowsByPosition.map(row => row.id);
    if (!dataRowsIds.every(rowId => originalDataRowsIds.includes(rowId)) || !originalDataRowsIds.every(rowId => dataRowsIds.includes(rowId))) {
      return true;
    }

    for (const row of this.dataRowsByPosition) {
      if (!row) continue;
      if (row.hasChanges()) return true;
    }
    return false;
  }

  hasErrors(): boolean {
    for (const row of this.dataRowsByPosition) {
      if (!row) continue;
      if (row.hasErrors()) return true;
    }
    return false;
  }

  getErrors(): IErrorData[] {
    let errors: IErrorData[] = [];

    for (const row of this.dataRowsByPosition) {
      if (!row) continue;
      errors.concat(row.getErrors());
    }
    return errors;
  }

  validate(): void {
    for (const row of this.dataRowsByPosition) {
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
      this.focusedCell && this.focusedCell.setFocus(false);
      return;
    }
    // let firstGroupRow = this.rows[0];
    // let cellGroupRow = cells[0].row.parentRow.parentRow;
    // let x = firstGroupRow === cellGroupRow;
    this.editCell(undefined);
    let rowsToSelect: IRow[]   = [];
    let cellsToSelect: ICell[] = [];

    cells.forEach(cell => {
      if (!cell.enabled || !cell.row.visible) {
        return;
      }
      cell.selected = true;
      // rowsToSelect.push(cell.row);
      let row = this.row(cell.row.id);
      // let test = cell.row === row; // testing to see that the two rows are the same object. Currently not, which is a bug
      if (row) {
        rowsToSelect.push(row);
      }
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
    freeze(() => {
      this.selectedCells.length = 0;
      this.selectedCells.push(...cellsToSelect);
    });

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
      let adjacentTopCell = this.adjacentTopCell(cell);
      let sameGroupTop    = !!adjacentTopCell && (adjacentTopCell.row.parentRow && adjacentTopCell.row.parentRow.id) === (cell.row.parentRow && cell.row.parentRow.id);
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
      let sameGroupBottom    = !!adjacentBottomCell && (adjacentBottomCell.row.parentRow && adjacentBottomCell.row.parentRow.id) === (cell.row.parentRow && cell.row.parentRow.id);
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

    cellsToSelect.sort(CellModel.positionCompare);
    this.selectCells(cellsToSelect, cell, false, append);
  }

  private selectCellsToMergeHelper(rows: IRow[], columnsToSelect: IColumn[]): IColumn[] {
    rows.forEach((row, idx) => {
      let colToSelectCount = columnsToSelect.length;
      let rowCells         = row.cellsByColumnPosition;
      rowCells.forEach(rowCell => {
        if (rowCell.colSpan === 1 || !columnsToSelect.some(col => col.id === rowCell.column.id)) {
          return;
        }

        if (rowCell.colSpan > 1) {
          for (let i = 1; i < rowCell.colSpan && rowCell.columnPosition + i < rowCells.length; i++) {
            columnsToSelect.push(rowCells[rowCell.columnPosition + i].column);
          }
        } else if (rowCell.colSpan === 0) {
          if (rowCell.columnPosition > 0) {
            let prevCell = rowCells[rowCell.columnPosition - 1];
            columnsToSelect.push(prevCell.column);
            while (prevCell.colSpan === 0 && prevCell.columnPosition > 0) {
              prevCell = rowCells[prevCell.columnPosition - 1];
              columnsToSelect.push(prevCell.column);
            }
          }
          if (rowCell.columnPosition < rowCells.length - 1) {
            let nextCell = rowCells[rowCell.columnPosition + 1];
            while (nextCell.colSpan === 0 && nextCell.columnPosition <= rowCells.length - 1) {
              columnsToSelect.push(nextCell.column);
              if (nextCell.columnPosition + 1 > rowCells.length - 1) {
                break;
              }
              nextCell = rowCells[nextCell.columnPosition + 1];
            }
          }
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
}

export function mergeRows(rows: IRow[], columns: IColumn[], mergeEmpty: boolean = false): void {
  for (const column of columns) {
    let previousValue: any;
    let previousCell: ICell | undefined;
    let rowSpan = 1;
    for (const r of allDataRows(rows)) {
      let cell = r.row.cells[column.name];
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

export default function create(rows: any[], columns: IColumn[], options?: IGridOptions): IGrid {
  return root((dispose) => {
    let grid     = observable(new GridModel(options));
    grid.loading = true;
    grid.initialize(dispose);
    freeze(() => {
      let fixedColumns: IColumn[]    = [];
      let standardColumns: IColumn[] = [];
      for (const column of columns) {
        if (column.fixed) {
          fixedColumns.push(column);
        } else {
          standardColumns.push(column);
        }
      }
      fixedColumns.forEach((column: IColumn) => grid.addColumn(column));
      standardColumns.forEach((column: IColumn) => grid.addColumn(column));
    });
    freeze(() => {
      let headerRow = columns.reduce((previous: any, current: any) => (previous[current.name] = current.title, previous), {});
      grid.addFixedRow({data: headerRow});
      let groupBy = options && options.groupBy;
      if (groupBy) grid.groupBy = groupBy.map(name => findColumnByName(grid.columns, name)!);
      grid._addRows(rows);
    });
    grid.loading = false;
    // mergeRows(grid.fixedRows, grid.fixedColumns);
    // mergeRows(grid.fixedRows, grid.standardColumns);
    // mergeRows(grid.rows, grid.standardColumns);
    grid.validate();
    grid.mergeColumns();
    return grid;
  });
}
