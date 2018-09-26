import {
  IGrid,
  ICell,
  IRow,
  IColumn,
  SortDirection,
  allRows,
  findColumnByName,
  findColumnByPosition,
  fixedRows,
  allDataRows,
  IRowIteratorResult,
  IDisposable,
  findRowById,
  cellPositionCompare,
  rowPositionCompare,
  columnPositionCompare,
}                  from './GridTypes';
import createRow   from './RowModel';
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
  _dataColumns      : () => IColumn[];
  _fixedColumns     : () => IColumn[];
  _sort             : IColumn[] = [];
  id                : number    = id++;
  enabled           : boolean   = true;
  removedRows       : IRowIteratorResult[] = [];
  rows              : IRow[]    = observable([]);
  fixedRows         : IRow[]    = observable([]);
  columns           : IColumn[] = [];
  dataRowsByPosition: IRow[]    = [];
  editingCell?      : ICell;
  selectedRows      : IRow[]  = [];
  selectedCells     : ICell[] = [];
  fixedWidth        : string  = '1px';
  loading           : boolean = false;
  width             : string  = '800px';
  height            : string  = '1600px';
  isDraggable       : boolean = false;
  clipboard         : ICell[] = [];
  multiSelect       : boolean = false;
  isMouseDown       : boolean = false;
  startCell?        : ICell   = undefined;
  private _dispose: () => void;

  constructor() {
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
      this.removedRows.length = 0;
      this.rows.length = 0;
      this.addRows(data);
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

  adjacentTopCell(cell: ICell): ICell | undefined {
    let adjacentTopCell = this.cellByPos(cell.rowPosition - 1, cell.columnPosition);
    if (adjacentTopCell && adjacentTopCell.colSpan === 0) {
      adjacentTopCell = this.adjacentLeftCell(adjacentTopCell);
    }

    let sameGroup = !!adjacentTopCell && (adjacentTopCell.row.parentRow && adjacentTopCell.row.parentRow.id) === (cell.row.parentRow && cell.row.parentRow.id);

    return sameGroup ? adjacentTopCell : undefined;
  }

  adjacentLeftCell(cell: ICell): ICell | undefined {
    let adjacentLeftCell: ICell | undefined;
    let i = 1;
    do {
      adjacentLeftCell = this.cellByPos(cell.rowPosition, cell.columnPosition - i++);
    } while (adjacentLeftCell && (!adjacentLeftCell.column.visible || adjacentLeftCell.colSpan === 0));

    return adjacentLeftCell;
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
      if (this.removedRows) {
        for (const removedRow of this.removedRows) {
          removedRow.rows.splice(removedRow.idx, 0, removedRow.row);
        }
        this.removedRows.length = 0;
      }

      for (const row of allDataRows(this.rows)) {
        for (const column of this.columns) {
          row.row.cells[column.name].value = row.row.data[column.name];
        }
      }
    });
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
    for (const rows of allRows(this.rows)) {
      rows.rows.sort((r1, r2) => {
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
      });
    }

    // recalibrate row positions and reset selection flags
    let newDataRowsByPosition: IRow[] = [];
    let totalRowCount                 = 0;
    for (const rows of allDataRows(this.rows)) {
      rows.row.position = totalRowCount;
      newDataRowsByPosition.push(rows.row);
      Object.values(rows.row.cells).forEach(cell => {
        cell.rowPosition               = totalRowCount;
        cell.row.position              = totalRowCount; // cell row and grid row different objects for some reason
        cell.isTopMostSelection        = false;
        cell.isLeftMostSelection       = false;
        cell.isAdjacentToTopSelection  = false;
        cell.isAdjacentToLeftSelection = false;
      });
      totalRowCount++;
    }

    this.dataRowsByPosition = newDataRowsByPosition;
    this.selectCells(this.selectedCells);

    // for (let rows of groupRows(this.rows)) {
    //   rows.rows.sort((r1, r2) => {
    //     for (const column of this._sort) {
    //       let compareFn = column.compare;
    //       let v1 = r1.cells[column.name].value;
    //       let v2 = r2.cells[column.name].value;
    //       let r  = compareFn ? compareFn(v1, v2) : compare(v1, v2);
    //       if (r !== 0) {
    //         if (column.sort === 'ascending') return r;
    //         return -1 * r;
    //       }
    //     }
    //     return 0;
    //   });
    // }
  }

  paste() {
    if (this.clipboard.length <= 0) {
      return;
    }

    let selectedCells = this.selectedCells.filter(selectedCell => !selectedCell.readOnly && selectedCell.enabled);
    if (selectedCells.length <= 0) {
      return;
    }

    let clipboardCells = this.clipboard.slice();
    selectedCells.forEach((selectedCell) => {
      for (let i = 0; i < clipboardCells.length; i++) {
        if (selectedCell.columnPosition === clipboardCells[i].columnPosition) {
          let v = (clipboardCells[i].value.clone && clipboardCells[i].value.clone()) || clipboardCells[i].value;
          selectedCell.value = v;
          clipboardCells.splice(i, 1);
          break;
        }
      }
    });
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
    let position    = this.columns.length;
    column.grid     = this;
    column.position = position;
    this.columns.push(column);
    return column;
  }

  addRow(row: any): IRow {
    let newRow = this._addRow(row);
    if (this.groupBy.length > 0) {
      this.setRowPositions();
      this.dataRowsByPosition.sort(rowPositionCompare);
    }
    return newRow;
  }

  _addRow(row: any): IRow {
    return createRow(this, this.rows, row);
  }

  addFixedRow(row: any): IRow {
    let newRow = createRow(this, this.fixedRows, row, true);
    this.mergeFixedRows();
    return newRow;
  }

  mergeFixedRows() {
    mergeRows(this.fixedRows, this.fixedColumns, true);
    mergeRows(this.fixedRows, this.dataColumns, true);
  }

  addRows(rows: any[]): void {
    for (const row of rows) {
      this._addRow(row);
    }

    if (this.groupBy.length > 0) {
      this.setRowPositions();
      this.dataRowsByPosition.sort(rowPositionCompare);
    }
  }

  setRowPositions() {
    let totalRowCount = 0;
    for (const rows of allDataRows(this.rows)) {
      rows.row.position = totalRowCount;
      Object.values(rows.row.cells).forEach(cell => {
        cell.rowPosition  = totalRowCount;
        cell.row.position = totalRowCount; // cell row and grid row different objects for some reason
      });
      totalRowCount++;
    }
  }

  hasChanges() {
    if (this.removedRows.length > 0) return true;
    for (const row of this.rows) {
      if (!row) continue;
      if (row.hasChanges()) return true;
    }
    return false;
  }

  selectRows(rows: IRow[]): void {
    let currentRows = this.selectedRows;

    if (currentRows.length <= 0 && rows.length <= 0) {
      return;
    }

    let currentRowsDiff = currentRows.filter(currRow => !rows.some(row => row.id === currRow.id));
    let rowsDiff        = rows.filter(row => !currentRows.some(currRow => currRow.id === row.id));

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

    this.selectCells(newSelectCells, true);
  }

  selectCells(cells: ICell[], multiSelect: boolean = false, append: boolean = false): void {
    let currentCells = this.selectedCells;

    if (currentCells.length <= 0 && cells.length <= 0) {
      return;
    }

    this.editCell(undefined);
    let currentCellsDiff       = currentCells.filter(currCell => !cells.some(cell => cell.id === currCell.id));
    let rowsToSelect: IRow[]   = [];
    let cellsToSelect: ICell[] = [];

    cells.forEach(cell => {
      if (cell.column.fixed) {
        return;
      }
      cell.selected = true;
      // rowsToSelect.push(cell.row);
      let row = this.row(cell.row.id);
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
          cellsToSelect.push(additionalCell);
        }
      }
    });

    if (append) {
      rowsToSelect  = rowsToSelect.concat(this.selectedRows);
      cellsToSelect = cellsToSelect.concat(currentCellsDiff);
      cellsToSelect.sort(cellPositionCompare);
    } else {
      currentCellsDiff.forEach(currentCell => {
        currentCell.selected                  = false;
        currentCell.isTopMostSelection        = false;
        currentCell.isLeftMostSelection       = false;
        currentCell.isAdjacentToLeftSelection = false;
        currentCell.isAdjacentToTopSelection  = false;
        let adjacentTopCell = this.adjacentTopCell(currentCell);
        if (adjacentTopCell && !adjacentTopCell.selected) {
          adjacentTopCell.isAdjacentToTopSelection = false;
        }

        let adjacentLeftCell = this.adjacentLeftCell(currentCell);
        if (adjacentLeftCell && !adjacentLeftCell.selected) {
          adjacentLeftCell.isAdjacentToLeftSelection = false;
        }
      });
    }

    cellsToSelect.forEach(cell => {
      let adjacentTopCell = this.adjacentTopCell(cell);
      if (adjacentTopCell) {
        adjacentTopCell.isAdjacentToTopSelection = !adjacentTopCell.selected && !adjacentTopCell.column.fixed ? true : false;
        cell.isTopMostSelection = false;
      } else {
        cell.isTopMostSelection = true;
      }

      let adjacentLeftCell = this.adjacentLeftCell(cell);
      if (adjacentLeftCell) {
        adjacentLeftCell.isAdjacentToLeftSelection = !adjacentLeftCell.selected && !adjacentLeftCell.column.fixed ? true : false;
        cell.isLeftMostSelection = adjacentLeftCell.column.fixed ? true : false;
      } else {
        cell.isLeftMostSelection = true;
      }
    });

    this.selectRows([...new Set(rowsToSelect)]);
    this.selectedCells = cellsToSelect;
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
      if (column && column.visible && !column.fixed) {
        columnsToSelect.push(column);
      }
    }

    if (append) {
      for (let i = 1; i < this.selectedCells.length; i++) {
        let selectedCell = this.selectedCells[i];

        if (!columnsToSelect.some(column => column.id === selectedCell.column.id)) {
          columnsToSelect.push(selectedCell.column);
        }
      }

      columnsToSelect.sort(columnPositionCompare);
    }

    let rowsToSelect = this.getRowsByRange(rowStart, rowEnd, false);
    if (append) {
      rowsToSelect = [...new Set(rowsToSelect.concat(this.selectedRows))];
    }

    // handle merged cells case
    rowsToSelect.filter(row => row.options && row.options.allowMergeColumns).map(row => Object.values(row.cells)).forEach(rowCells => {
      rowCells.forEach(rowCell => {
        if (!columnsToSelect.some(col => col.id === rowCell.column.id)) {
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
    });

    let cellsToSelect: ICell[] = [];
    rowsToSelect.forEach(row => {
      columnsToSelect.forEach(column => {
        let cell = row.cells[column.name];
        if (cell) {
          cellsToSelect.push(cell);
        }
      });
    });

    cellsToSelect.sort(cellPositionCompare);
    this.selectCells(cellsToSelect, true, append);
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
    let grid = observable(new GridModel());
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
      grid.addRows(rows);
    });
    // mergeRows(grid.fixedRows, grid.fixedColumns);
    // mergeRows(grid.fixedRows, grid.dataColumns);
    // mergeRows(grid.rows, grid.dataColumns);
    return grid;
  });
}
