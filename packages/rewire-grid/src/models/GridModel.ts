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
  IToggleableColumnsOptions,
}                              from './GridTypes';
import {isNullOrUndefined}     from 'rewire-common';
import createRow, {RowModel}   from './RowModel';
import {ColumnModel}           from './ColumnModel';
import {CellModel}             from './CellModel';
import {
  gridStaticKeybinds,
  gridDefaultVariableKeybinds
}                  from './GridKeybinds';
import * as merge  from 'deepmerge';
import {
  observable,
  computed,
  observe,
  freeze,
  root,
  watch,
  sample
}                  from 'rewire-core';
import {
  compare,
  Validator
}                  from 'rewire-ui';

let id = 0;
class GridModel implements IGrid, IDisposable {
  _standardColumns          : () => IColumn[];
  _fixedColumns             : () => IColumn[];
  _sort                     : IColumn[];
  id                        : number;
  enabled                   : boolean;
  readOnly                  : boolean;
  verticalAlign             : VerticalAlignment;
  rows                      : IRow[];
  fixedRows                 : IRow[];
  headerRowHeight?          : number;
  columns                   : IColumn[];
  toggleableColumns         : IColumn[];
  toggleableColumnsOptions? : IToggleableColumnsOptions;
  editingCell?              : ICell;
  selectedRows              : IRow[];
  selectedCells             : ICell[];
  focusedCell?              : ICell;
  fixedWidth                : string;
  rowHeight?                : number;
  loading                   : boolean;
  isDraggable               : boolean;
  clipboard                 : {value: any, columnPosition: number}[];
  multiSelect               : boolean;
  allowMergeColumns         : boolean;
  isMouseDown               : boolean;
  clearSelectionOnBlur      : boolean;
  rowKeybindPermissions     : IGridRowKeybindPermissions;
  staticKeybinds            : IGridStaticKeybinds;
  variableKeybinds          : IGridVariableKeybinds;
  startCell?                : ICell;
  __validator               : Validator;
  changed                   : boolean;
  inError                   : boolean;

  private _dispose: () => void;

  private constructor() { }

  private initialize(dispose: () => void, options?: IGridOptions) {
    this.__validator                = new Validator();
    this._dispose                   = dispose;
    this._sort                      = [];
    this.id                         = id++;
    this.rows                       = [];
    this.fixedRows                  = [];
    this.columns                    = [];
    this.editingCell                = undefined;
    this.selectedRows               = [];
    this.selectedCells              = [];
    this.focusedCell                = undefined;
    this.fixedWidth                 = '1px';
    this.loading                    = false;
    this.enabled                    = options && !isNullOrUndefined(options.enabled) ? options.enabled! : true;
    this.readOnly                   = options && !isNullOrUndefined(options.readOnly) ? options.readOnly! : false;
    this.verticalAlign              = options && options.verticalAlign || 'middle';
    this.isDraggable                = options && !isNullOrUndefined(options.isDraggable) ? options.isDraggable! : false;
    this.multiSelect                = options && !isNullOrUndefined(options.multiSelect) ? options.multiSelect! : false;
    this.allowMergeColumns          = options && !isNullOrUndefined(options.allowMergeColumns) ? options.allowMergeColumns! : false;
    this.clearSelectionOnBlur       = options && !isNullOrUndefined(options.clearSelectionOnBlur) ? options.clearSelectionOnBlur! : true;
    this.toggleableColumnsOptions   = options && options.toggleableColumnsOptions;
    this.clipboard                  = [];
    this.isMouseDown                = false;
    this.startCell                  = undefined;
    this.changed                    = false;
    this.inError                    = false;

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

    const columns           = observe(() => {this.columns.map((column: IColumn) => column.fixed); });
    this._fixedColumns      = computed(columns, () => this.columns.filter((h) => h.fixed), []);
    this._standardColumns   = computed(columns, () => this.columns.filter((h) => !h.fixed), []);

    watch(() => this.rows.length, () => {
      this.inError = this.hasErrors();
    });
    return this;
  }

  private disposeRows() {
    for (const row of this.rows) {
      row.dispose();
    }
  }

  dispose() {
    this.disposeRows();
    if (this._dispose) this._dispose();
  }

  get validator() {
    return this.__validator;
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
      this.rows.length                       = 0;
      this.selectedRows.length               = 0;
      this.selectedCells.length              = 0;
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

  move(cell: ICell, byRows: number = 1, byColumns: number = 1) {
    return sample(() =>  {
      let currentRowPosition = cell.rowPosition;
      let row: IRow | undefined = cell.row;
      let rowDirection = (byRows) > 0 ? 1 : -1;
      while(byRows !== 0 && (currentRowPosition >= 0) && (currentRowPosition < this.rows.length))  {
        currentRowPosition += rowDirection;
        const r = this.rows[currentRowPosition];
        if (r && r.visible) {
          byRows -= rowDirection;
          row = r;
        }
      }

      let currentColumnPosition = cell.columnPosition;
      let column: IColumn | undefined = cell.column;
      let columnDirection = (byColumns) > 0 ? 1 : -1;
      const c2 = row.cells[column.name];
      if (c2.colSpan === 0 && (byColumns === 0)) byColumns = -1;
      while(byColumns !== 0 && (currentColumnPosition >= 0) && (currentColumnPosition < this.rows.length))  {
        currentColumnPosition += columnDirection;
        const c    = this.columns[currentColumnPosition];
        if (c && c.visible && c.enabled) {
          const cell = row.cells[c.name];
          if (cell && (cell.colSpan > 0)) {
            byColumns -= columnDirection;
            column = c;
          }
        }
      }

      const c = row.cells[column.name];
      return (c === cell) ? undefined : c;
    });
  }

  adjacentTopCell(cell: ICell, onlySelectable: boolean = false): ICell | undefined {
    return this.move(cell, -1, 0);
  }

  adjacentBottomCell(cell: ICell, onlySelectable: boolean = false): ICell | undefined {
    return this.move(cell, 1, 0);
  }

  adjacentRightCell(cell: ICell, onlySelectable: boolean = false): ICell | undefined {
    return this.move(cell, 0, 1);
  }

  adjacentLeftCell(cell: ICell, onlySelectable: boolean = false): ICell | undefined {
    return this.move(cell, 0, -1);
  }

  nextCell(cell: ICell, onlySelectable: boolean = false): ICell | undefined {
    let nextCell = this.move(cell, 0, 1);
    if (nextCell === undefined) {
      nextCell = this.move(cell, 1, -cell.columnPosition);
      if ((nextCell === undefined) || (nextCell.row === cell.row)) return undefined;
    }
    return nextCell;
  }

  previousCell(cell: ICell, onlySelectable: boolean = false): ICell | undefined {
    let prevCell = this.move(cell, 0, -1);
    if (prevCell === undefined) {
      prevCell = this.move(cell, -1, this.columns.length - cell.columnPosition);
      if ((prevCell === undefined) || (prevCell.row === cell.row)) return undefined;
    }
    return prevCell;
  }

  firstCell(onlySelectable: boolean = false): ICell | undefined {
    let firstCell = this.cellByPos(0, 0);
    if (firstCell && (firstCell.colSpan === 0 || (onlySelectable && !firstCell.enabled))) {
      firstCell = this.nextCell(firstCell, true);
    }

    return firstCell;
  }

  lastCell(onlySelectable: boolean = false): ICell | undefined {
    let lastCell = this.cellByPos(this.rows.length - 1, this.columns.length - 1);
    if (lastCell && (lastCell.colSpan === 0 || (onlySelectable && !lastCell.enabled))) {
      lastCell = this.previousCell(lastCell, true);
    }

    return lastCell;
  }

  firstCellInRow(row: IRow, onlySelectable: boolean = false): ICell | undefined {
    let firstCellInRow = this.cellByPos(row.position, 0);
    if (firstCellInRow && (firstCellInRow.colSpan === 0 || (onlySelectable && !firstCellInRow.enabled))) {
      firstCellInRow = this.adjacentRightCell(firstCellInRow, true);
    }

    return firstCellInRow;
  }

  lastCellInRow(row: IRow, onlySelectable: boolean = false): ICell | undefined {
    let lastCellInRow = this.cellByPos(row.position, this.columns.length - 1);
    if (lastCellInRow && (lastCellInRow.colSpan === 0 || (onlySelectable && !lastCellInRow.enabled))) {
      lastCellInRow = this.adjacentLeftCell(lastCellInRow, true);
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

  clear() {
    this.rows.set([]);
  }

  clearSelectedCells() {
    this.selectedCells.forEach(cell => cell.clear());
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
    if (!this._sort || this._sort.length === 0) return;
    let rowCompareFn = (r1: IRow, r2: IRow): number => {
      if (this.groupBy && (this.groupBy.length > 0)) {
        for (const column of this.groupBy) {
          let compareFn = column.compare;
          let v1 = r1.cells[column.name].value;
          let v2 = r2.cells[column.name].value;
          let r  = compareFn ? compareFn(v1, v2) : compare(v1, v2);
          if (r !== 0) {
            if (column.sort === 'ascending') return r;
            return -1 * r;
          }
        }
      }

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

    let selectedCells = this.selectedCells.filter(selectedCell => !selectedCell.readOnly && selectedCell.enabled);
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

  get hasToggleableColumns(): boolean {
    return this.toggleableColumns && this.toggleableColumns.length > 0;
  }

  addColumn(column: IColumn): IColumn {
    column.grid     = this;
    column.position = this.columns.length;
    this.columns.push(column);
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

  duplicateRow(rowId: string, position?: number): IRow | undefined {
    const row = findRowById(this.rows, rowId);
    if (!row) return;
    const rowData: IRowData = {id: String(id++), data: Object.assign({}, row.data), options: row.options};
    return this.addRow(rowData, position);
  }

  duplicateRows(ids: string[], position?: number): IRow[] {
    let duplicatedRows: IRow[] = [];
    let pos = position;
    ids.forEach(id => {
      let duplicatedRow = this.duplicateRow(id, pos);
      if (duplicatedRow) {
        duplicatedRows.push(duplicatedRow);
      }
      if (!isNullOrUndefined(pos)) {
        pos!++;
      }
    });

    return duplicatedRows;
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
    return this.addRow(insertData, insertPosition);
  }

  setRowPositions() {
    for (let rowIdx = 0; rowIdx < this.rows.length; rowIdx++) {
      this.rows[rowIdx].position = rowIdx;
    }
  }

  setColumnPositions() {
    for (let colIdx = 0; colIdx < this.columns.length; colIdx++) {
      this.columns[colIdx].position = colIdx;
    }
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
      this.focusedCell && this.focusedCell.setFocus(false);
      return;
    }

    this.editCell(undefined);
    let rowsToSelect: IRow[]   = [];
    let cellsToSelect: ICell[] = [];

    cells.forEach(cell => {
      if (!cell.enabled || !cell.row.visible) {
        return;
      }
      cell.selected = true;
      rowsToSelect.push(cell.row);
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
      let adjacentTopCell = this.adjacentTopCell(cell);
      let sameGroupTop    = !!adjacentTopCell && true; //(adjacentTopCell.row.parentRow && adjacentTopCell.row.parentRow.id) === (cell.row.parentRow && cell.row.parentRow.id);
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
      let sameGroupBottom    = !!adjacentBottomCell && true; //(adjacentBottomCell.row.parentRow && adjacentBottomCell.row.parentRow.id) === (cell.row.parentRow && cell.row.parentRow.id);
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

    // cellsToSelect.sort(CellModel.positionCompare);
    this.selectCells(cellsToSelect, cell, false, append);
  }

  private selectCellsToMergeHelper(rows: IRow[], columnsToSelect: IColumn[]): IColumn[] {
    rows.forEach((row, idx) => {
      let colToSelectCount = columnsToSelect.length;
      let rowCells         = columnsToSelect.map(column => row.cells[column.name]);
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

  static create(rows: any[], columns: IColumn[], options?: IGridOptions): IGrid {
    return root((dispose: any) => {
      let grid     = observable(new GridModel());
      grid.initialize(dispose, options);
      grid.loading = true;
      freeze(() => {
        for (const column of columns) {
          const c: ColumnModel = (column as ColumnModel);
          if (c.__validators) grid.__validator.addRule(column.name, c.__validators);
          grid.addColumn(column);
        }
      });
      freeze(() => {
        let headerRow = columns.reduce((previous: any, current: any) => (previous[current.name] = current.title, previous), {});
        grid.addFixedRow({data: headerRow});
        let groupBy = options && options.groupBy;
        if (groupBy) {
          grid.groupBy = groupBy.map((name: string) => grid.column(name)).filter((column: IColumn | undefined) => !isNullOrUndefined(column)) as IColumn[];
        }
        let toggleableColumns  = options && options.toggleableColumns;
        grid.toggleableColumns = toggleableColumns
                                   ? toggleableColumns.map((name: string) => grid.column(name)).filter((column: IColumn | undefined) => !isNullOrUndefined(column) && !column!.isGroupByColumn) as IColumn[]
                                   : [];
      });
      freeze(() => {
        grid.setColumnPositions();
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
