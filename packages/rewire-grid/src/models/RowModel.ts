import {
  IGrid,
  IColumn,
  ICell,
  IRow,
  ICellMap,
  IGroupRow,
  IRows,
  getValue,
  IDisposable,
}                   from './GridTypes';
import createCell   from './CellModel';
import {observable,
  observe,
  root
} from 'rewire-core';
import * as nanoid  from 'nanoid';

const EmptyFn = () => {};

class RowModel implements IRow, IDisposable {
  id      : string;
  grid    : IGrid;
  cells   : ICellMap = observable({});
  selected: boolean  = false;
  cls     : string   = '';
  dispose : () => void = EmptyFn;

  constructor(grid: IGrid, public data: any) {
    this.grid = grid;
    if (!this.data) return;
    if (data.id) {
      this.id = data.id;
    } else {
      this.id = nanoid(10);
    }

    for (const column of this.grid.columns) {
      this.createCell(column, this.data[column.name]);
    }
    root((dispose) => {
      this.dispose = dispose;
      observe(this.mergeColumns);
    });
  }

  createCell(column: IColumn, value: any): ICell {
    return this.cells[column.name] = createCell(this, column, value);
  }

  mergeColumns = () => {
    let previousValue: any;
    let previousCell: ICell | undefined;
    let colSpan = 1;
    for (const column of this.grid.dataColumns) {
      if (!column.visible) {
        continue;
      }

      let cell = this.cells[column.name];
      if (previousCell && cell && (previousValue === cell.value)) {
        colSpan++;
        cell.colSpan = 0;
        continue;
      }
      if (previousCell) {
        previousCell.colSpan = colSpan;
      }

      colSpan       = 1;
      previousCell  = cell;
      previousValue = cell.value;
    }

    if (previousCell) {
      previousCell.colSpan = colSpan;
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

export default function create(grid: IGrid, rows: IRow[], row: any, fixed: boolean = false): IRow {
  if (grid.groupBy.length > 0 && !fixed) {
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