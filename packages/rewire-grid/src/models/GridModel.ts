import {
  IGrid,
  ICell,
  IRow,
  IColumn,
  SortDirection,
  groupRows,
  allRows,
  findColumn,
  fixedRows,
  allDataRows,
  IRowIteratorResult,
  IDisposable,
  findRowById
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
  _dataColumns  : () => IColumn[];
  _fixedColumns : () => IColumn[];
  _sort         : IColumn[] = [];
  id            : number    = id++;
  enabled       : boolean   = true;
  removedRows   : IRowIteratorResult[] = [];
  rows          : IRow[]    = observable([]);
  fixedRows     : IRow[]    = observable([]);
  columns       : IColumn[] = [];
  selectedRow?  : IRow;
  selectedCell? : ICell;
  editingCell?  : ICell;
  fixedWidth    : string;
  loading       : boolean = false;
  width         : string = '800px';
  height        : string = '1600px';
  isDraggable   : boolean = false;
  clipboard     : ICell;
  private _dispose: () => void;

  constructor() {
    this.fixedWidth = '1px';
  }

  initialize(dispose: () => void) {
    if (this.rows && (this.rows.length > 0)) {
      this.selectedRow = this.rows[0];
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
    let selectedCell = this.selectedCell;
    if (!selectedCell) {
      return;
    }

    this.clipboard = selectedCell.clone(this.selectedRow!);
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

  cell(rowId: string, columnName: string): ICell | undefined {
    const row = findRowById(allDataRows(this.rows), rowId);
    if (!row) return undefined;
    return row.row.cells[columnName];
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

    // for (let rows of allGroupRows(this.rows)) {
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
    if (!this.clipboard) {
      return;
    }

    let selectedCell = this.selectedCell;
    if (!selectedCell) {
      return;
    }

    if (selectedCell.column !== this.clipboard.column) {
      return;
    }

    let v = this.clipboard.value.clone && this.clipboard.value.clone() || this.clipboard.value;
    selectedCell.value = v;
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
    column.grid = this;
    this.columns.push(column);
    return column;
  }

  addRow(row: any): IRow {
    return createRow(this, this.rows, row);
  }

  addFixedRow(row: any): IRow {
    return createRow(this, this.fixedRows, row, true);
  }

  addRows(rows: any[]): void {
    for (const row of rows) {
      this.addRow(row);
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

  selectRow(row?: IRow): void {
    let currentRow = this.selectedRow;
    if (currentRow === row) return;

    if (currentRow) {
      currentRow.selected = false;
    }
    if (row) {
      row.selected = true;
    }
    this.selectedRow = row;
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

    this.selectCell(cell);
    cell.setEditing(true);
    this.editingCell = cell;
  }

  selectCell(cell?: ICell): void {
    let currentCell = this.selectedCell;
    if (cell === currentCell) {
      return;
    }

    this.editCell(undefined);
    if (currentCell) {
      currentCell.selected = false;
    }

    if (cell) {
      cell.selected = true;
      this.selectedRow = cell.row;
    } else {
      this.selectedRow = undefined;
    }

    this.selectedCell = cell;
  }
}

function mergeRows(rows: IRow[], columns: IColumn[]): void {
  for (const column of columns) {
    let previousValue: any;
    let previousCell: ICell | undefined;
    let rowSpan = 1;
    for (const r of allDataRows(rows)) {
      let cell = r.row.cells[column.name];
      if (previousCell && cell && (previousValue === cell.value)) {
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
      if (groupBy) grid.groupBy = groupBy.map(name => findColumn(grid.columns, name)!);
      grid.addRows(rows);
    });
    mergeRows(grid.fixedRows, grid.fixedColumns);
    mergeRows(grid.fixedRows, grid.dataColumns);
    // mergeRows(grid.rows, grid.dataColumns);
    return grid;
  });
}
