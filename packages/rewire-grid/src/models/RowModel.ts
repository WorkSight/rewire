import {
  IGrid,
  IColumn,
  ICell,
  IRow,
  ICellMap,
  IGroupRow,
  IRows,
  getValue,
}                   from './GridTypes';
import createCell   from './CellModel';
import {observable} from 'rewire-core';

let id = 0;

class RowModel implements IRow {
  id      : number    = id++;
  grid    : IGrid;
  cells   : ICellMap = observable({});
  selected: boolean  = false;
  cls     : string   = '';

  constructor(grid: IGrid, public data: any) {
    this.grid = grid;
    if (!this.data) return;

    for (const column of this.grid.columns) {
      this.createCell(column, this.data[column.name]);
    }
    this.mergeColumns();
  }

  createCell(column: IColumn, value: any): ICell {
    return this.cells[column.name] = createCell(this, column, value);
  }

  mergeColumns() {
    let previousValue: any;
    let previousCell: ICell | undefined;
    let colSpan = 1;
    for (const column of this.grid.dataColumns) {
      let cell = this.cells[column.name];
      if (previousCell && cell && (previousValue === cell.value)) {
        previousCell.colSpan = ++colSpan;
        cell.colSpan = 0;
        continue;
      }
      previousCell  = cell;
      previousValue = cell.value;
    }
  }

  hasChanges() {
    for (const column of this.grid.columns) {
      let cell = this.cells[column.name];
      if (!cell) continue;
      if (cell.hasChanges()) return true;
    }
    return false;
  }
}

function find(rows: IRows, column: IColumn, row: any): IGroupRow | undefined {
  let value = getValue(row, column);
  for (const r of rows.rows) {
    if (value === getValue(r, column)) {
      return r as IGroupRow;
    }
  }
  return undefined;
}

export default function create(grid: IGrid, rows: IRow[], row: any): IRow {
  if (grid.groupBy.length > 0) {
    let root:   IGroupRow;
    let parent: IRows = grid;
    let level = 0;
    for (const column of grid.groupBy) {
      let r = find(parent, column, row);
      if (!r) {
        r = new GroupModel(grid, parent, row, column, level);
        parent.rows.push(r);
      }

      if (level === 0) root = r;
      level++;
      parent = r;
    }
    parent.rows.push(new RowModel(grid, row));
    return root!;
  }
  let r = new RowModel(grid, row);
  rows.push(r);
  return r;
}

class GroupModel extends RowModel implements IGroupRow {
  rows    : IRow[]  = [];
  expanded: boolean = true;

  constructor(grid: IGrid, parent: IRows, data: any, public column: IColumn, public level: number) {
    super(grid, data);
  }
}