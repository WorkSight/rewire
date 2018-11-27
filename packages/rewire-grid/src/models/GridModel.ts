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
  IRowIteratorResult,
  IDisposable,
  findRowById,
  cloneValue,
}                              from './GridTypes';
import createRow, {RowModel}   from './RowModel';
import {ColumnModel}           from './ColumnModel';
import {CellModel}             from './CellModel';
import * as is                 from 'is';
import {
  observable,
  computed,
  observe,
  freeze,
  root
}                  from 'rewire-core';
import { compare } from 'rewire-ui';

let id = 0;
class GridModel implements IGrid, IDisposable {
  _dataColumns              : () => IColumn[];
  _fixedColumns             : () => IColumn[];
  _sort                     : IColumn[];
  id                        : number;
  enabled                   : boolean;
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
  fixedWidth                : string;
  loading                   : boolean;
  width                     : string;
  height                    : string;
  isDraggable               : boolean;
  clipboard                 : ICell[];
  multiSelect               : boolean;
  isMouseDown               : boolean;
  startCell?                : ICell;
  changed                   : boolean;
  inError                   : boolean;

  private _dispose: () => void;

  constructor() {
    this._sort                      = [];
    this.id                         = id++;
    this.enabled                    = true;
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
    this.fixedWidth                 = '1px';
    this.loading                    = false;
    this.width                      = '800px';
    this.height                     = '1600px';
    this.isDraggable                = false;
    this.clipboard                  = [];
    this.multiSelect                = false;
    this.isMouseDown                = false;
    this.startCell                  = undefined;
    this.changed                    = false;
    this.inError                    = false;
  }

  initialize(dispose: () => void) {
    if (this.rows && (this.rows.length > 0)) {
      this.selectedRows = [this.rows[0]];
    }

    this._dispose      = dispose;
    const columns      = observe(() => this.columns.length);
    this._fixedColumns = computed(columns, () => this.columns.filter((h) => h.fixed), []);
    this._dataColumns  = computed(columns, () => this.columns.filter((h) => !h.fixed), []);
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

  get(): any[] {
    const data: any[] = [];
    for (const row of allDataRows(this.rows)) {
      let rowData: any = {};
      data.push(rowData);
      for (const column of this.columns) {
        rowData[column.name] = row.row.cells[column.name].value;
      }
    }
    return data;
  }

  set(data: any[]): void {
    this.disposeRows();
    freeze(() => {
      this.addedRows.length                  = 0;
      this.removedRows.length                = 0;
      this.rows.length                       = 0;
      this.dataRowsByPosition.length         = 0;
      this.originalDataRowsByPosition.length = 0;
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
    } while (onlySelectable && adjacentTopCell && (!adjacentTopCell.row.visible || !adjacentTopCell.enabled || adjacentTopCell.column.fixed || !adjacentTopCell.column.visible));

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
    } while (adjacentRightCell && (!adjacentRightCell.column.visible || adjacentRightCell.colSpan === 0 || (onlySelectable && (adjacentRightCell.column.fixed || !adjacentRightCell.enabled))));

    return adjacentRightCell;
  }

  adjacentBottomCell(cell: ICell, onlySelectable: boolean = false): ICell | undefined {
    let adjacentBottomCell: ICell | undefined;
    let i = 1;
    do {
      adjacentBottomCell = this.cellByPos(cell.rowPosition + i++, cell.columnPosition);
    } while (onlySelectable && adjacentBottomCell && (!adjacentBottomCell.row.visible || !adjacentBottomCell.enabled || adjacentBottomCell.column.fixed || !adjacentBottomCell.column.visible));

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
    } while (adjacentLeftCell && (!adjacentLeftCell.column.visible || adjacentLeftCell.colSpan === 0 || (onlySelectable && (adjacentLeftCell.column.fixed || !adjacentLeftCell.enabled))));

    return adjacentLeftCell;
  }

  nextCell(cell: ICell, onlySelectable: boolean = false): ICell | undefined {
    let nextCell = this.adjacentRightCell(cell, onlySelectable);
    if (!nextCell) {
      nextCell = this.cellByPos(cell.rowPosition + 1, 0);
      if (nextCell && (!nextCell.column.visible || nextCell.colSpan === 0 || (onlySelectable && (nextCell.column.fixed || !nextCell.enabled)))) {
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
      if (prevCell && (!prevCell.column.visible || prevCell.colSpan === 0 || (onlySelectable && (prevCell.column.fixed || !prevCell.enabled)))) {
        prevCell = this.adjacentLeftCell(prevCell, onlySelectable);
      }
    }

    return prevCell;
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

  revert(): void {
    freeze(() => {
      let originalDataRowIds = this.originalDataRowsByPosition.map(row => row.id);
      if (this.removedRows) {
        for (const removedRow of this.removedRows) {
          if (originalDataRowIds.includes(removedRow.row.id)) {
            removedRow.rows.splice(removedRow.idx, 0, removedRow.row);
            this.dataRowsByPosition.splice(removedRow.row.position, 0, removedRow.row);
          }
        }
        this.removedRows.length = 0;
      }

      if (this.addedRows) {
        // remove added rows
        for (const addedRow of this.addedRows) {
          if (!originalDataRowIds.includes(addedRow.row.id)) {
            let idx: number;
            idx = addedRow.rows.findIndex(row => row.id === addedRow.row.id);
            if (idx >= 0) addedRow.rows.splice(idx, 1);
            idx = this.dataRowsByPosition.findIndex(row => row.id === addedRow.row.id);
            if (idx >= 0) this.dataRowsByPosition.splice(idx, 1);
          }
        }
        this.addedRows.length = 0;
      }

      this.dataRowsByPosition.forEach(row => {
        for (const column of this.columns) {
          row.cells[column.name].value = cloneValue(row.data[column.name]);
        }
      });
    });
    this.sort();
  }

  _removeRow(iterator: IterableIterator<IRowIteratorResult>, id: string): void {
    const row = findRowById(iterator, id);
    if (!row) return;
    this.removedRows.push(row);
    row.rows.splice(row.idx, 1);
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

  removeSelectedRows(): void {
    this.removeRows(this.selectedRows.map(row => row.id));
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

    this.dataRowsByPosition = newDataRowsByPosition;
    this.updateCellSelectionProperties(this.selectedCells);
  }

  sortItems(items: any[], comparer: (a: any, b: any) => number) {
    items.sort(comparer);
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

      let clipboardCell  = clipboardCellsForColumn.shift();
      selectedCell.value = cloneValue(clipboardCell.value);

      if (clipboardCellsForColumn.length <= 0) {
        clipboardCellsByColumnPosition[selectedCell.columnPosition] = clipboardCellsByColumnPositionOriginal[selectedCell.columnPosition].slice();
      }
    });

    this.updateCellSelectionProperties(this.selectedCells);
  }

  get fixedColumns() {
    return this._fixedColumns();
  }

  get dataColumns() {
    return this._dataColumns();
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

  addRow(row: any, position?: number): IRow {
    let newRow = this._addRow(row, position);

    if (position !== undefined || this.groupBy.length > 0) {
      this.setRowPositions();
    }

    const addedRow = findRowById(allDataRows(this.rows), newRow.id);
    if (addedRow) {
      this.addedRows.push(addedRow);
    }

    return newRow;
  }

  _addRow(row: any, position?: number): IRow {
    return createRow(this, this.rows, row, position);
  }

  addFixedRow(row: any, position?: number): IRow {
    let newRow = createRow(this, this.fixedRows, row, position, true);
    this.mergeFixedRows();
    return newRow;
  }

  mergeFixedRows() {
    mergeRows(this.fixedRows, this.fixedColumns, true);
    mergeRows(this.fixedRows, this.dataColumns, true);
  }

  addRows(rows: any[], position?: number): void {
    let newRows = this._addRows(rows, position);
    for (const newRow of newRows) {
      const addedRow = findRowById(allDataRows(this.rows), newRow.id);
      if (addedRow) {
        this.addedRows.push(addedRow);
      }
    }
  }

  _addRows(rows: any[], position?: number): IRow[] {
    let addedRows: IRow[] = [];
    let pos               = position;
    for (const row of rows) {
      addedRows.push(this._addRow(row, pos));
      if (pos !== undefined) {
        pos++;
      }
    }

    if (position !== undefined || this.groupBy.length > 0) {
      this.setRowPositions();
    }

    return addedRows;
  }

  _duplicateRow(iterator: IterableIterator<IRowIteratorResult>, id: string, position?: number): void {
    const row = findRowById(iterator, id);
    if (!row) return;
    let rowValuesObj = {};
    Object.keys(row.row.cells).forEach(columnName => {
      rowValuesObj[columnName] = cloneValue(row.row.cells[columnName].value);
    });
    let rowToAdd: any = {options: row.row.options, ...rowValuesObj};
    this.addRow(rowToAdd, position);
  }

  duplicateRow(id: string, position?: number): void {
    this._duplicateRow(allDataRows(this.rows), id, position);
  }

  duplicateRows(ids: string[], position?: number): void {
    let pos = position;
    ids.forEach(id => {
      this.duplicateRow(id, pos);
      if (pos !== undefined) {
        pos++;
      }
    });
  }

  duplicateSelectedRows(): void {
    this.duplicateRows(this.selectedRows.map(row => row.id), Math.max(...this.selectedRows.map(row => row.position)));
  }

  insertRowAtSelection(): void {
    let rowToInsert = {};
    this.groupBy.forEach((column: IColumn) => {
      rowToInsert[column.name] = this.selectedRows[0].cells[column.name].value;
    });
    this.addRow(rowToInsert, Math.max(...this.selectedRows.map(row => row.position)));
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

    this.selectedRows = rows;
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

    this.selectCells([cell]);
    this.editingCell = cell;
    cell.setEditing(true);
  }

  unselectCells(cells: ICell[]): void {
    let t0 = performance.now();

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
    let t1 = performance.now();
    console.log(`Call to unselectCells took: ${t1 - t0} milliseconds.`);
    this.selectCells(newSelectCells, true);
  }

  selectCells(cells: ICell[], multiSelect: boolean = false, append: boolean = false): void {
    let t0 = performance.now();
    let currentCells = this.selectedCells;

    if (currentCells.length <= 0 && cells.length <= 0) {
      return;
    }
    // let firstGroupRow = this.rows[0];
    // let cellGroupRow = cells[0].row.parentRow.parentRow;
    // let x = firstGroupRow === cellGroupRow;
    this.editCell(undefined);
    let rowsToSelect: IRow[]   = [];
    let cellsToSelect: ICell[] = [];

    cells.forEach(cell => {
      if (!cell.enabled || cell.column.fixed || !cell.row.visible) {
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

      if (!multiSelect) {
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
        currentCell.selected              = false;
        currentCell.isTopMostSelection    = false;
        currentCell.isRightMostSelection  = false;
        currentCell.isBottomMostSelection = false;
        currentCell.isLeftMostSelection   = false;
      });
    }

    this.updateCellSelectionProperties(cellsToSelect);
    this.selectRows([...new Set(rowsToSelect)]);
    this.selectedCells = cellsToSelect;
    let t1 = performance.now();
    console.log(`Call to selectCells took: ${t1 - t0} milliseconds.`);
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
    let t0 = performance.now();
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
      if (column && column.visible && !column.fixed) {
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
    columnsToSelect = this.selectCellsToMergeHelper(rowsToSelect.filter(row => row.options && row.options.allowMergeColumns), columnsToSelect);

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
    let t1 = performance.now();
    console.log(`Call to selectCellsTo took: ${t1 - t0} milliseconds.`);
    this.selectCells(cellsToSelect, true, append);
  }

  selectCellsToMergeHelper(rows: IRow[], columnsToSelect: IColumn[]): IColumn[] {
    rows.forEach((row, idx) => {
      let colToSelectCount = columnsToSelect.length;
      let rowCells         = row.cellsByColumnPosition;
      rowCells.forEach(rowCell => {
        if (rowCell.colSpan === 1 || !columnsToSelect.some(col => col.id === rowCell.column.id)) {
          return;
        }

        if (rowCell.colSpan > 1) {
          for (let i = 1; i < rowCell.colSpan && rowCell.columnPosition + i < rowCells.length - 1; i++) {
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

export default function create(rows: any[], columns: IColumn[], groupBy?: string[]): IGrid {
  return root((dispose) => {
    let grid     = observable(new GridModel());
    grid.loading = true;
    grid.initialize(dispose);
    freeze(() => {
      for (const column of columns) {
        grid.addColumn(column);
      }
    });
    freeze(() => {
      let headerRow = columns.reduce((previous: any, current: any) => (previous[current.name] = current.title, previous), {});
      grid.addFixedRow(headerRow);
      if (groupBy) grid.groupBy = groupBy.map(name => findColumnByName(grid.columns, name)!);
      grid._addRows(rows);
    });
    grid.loading = false;
    // mergeRows(grid.fixedRows, grid.fixedColumns);
    // mergeRows(grid.fixedRows, grid.dataColumns);
    // mergeRows(grid.rows, grid.dataColumns);
    grid.validate();
    grid.inError = grid.hasErrors();
    return grid;
  });
}
