import {
  IGrid,
  IColumn,
  ICell,
  IRow,
  IRowOptions,
  ICellMap,
  IGroupRow,
  IRows,
  getValue,
  IDisposable,
  cellPositionCompare,
}                   from './GridTypes';
import createCell   from './CellModel';
import {observable,
  observe,
  root
} from 'rewire-core';
import * as nanoid  from 'nanoid';

const EmptyFn = () => {};

class RowModel implements IRow, IDisposable {
  id                   : string;
  grid                 : IGrid;
  cells                : ICellMap = observable({});
  cellsByColumnPosition: ICell[];
  selected             : boolean  = false;
  cls                  : string   = '';
  options              : IRowOptions;
  position             : number;
  parentRow            : IGroupRow;
  dispose              : () => void = EmptyFn;

  constructor(grid: IGrid, public data: any, position: number = 0, fixed: boolean = false) {
    this.grid = grid;
    if (!this.data) return;
    if (data.id) {
      this.id = String(data.id);
    } else {
      this.id = nanoid(10);
    }

    this.options  = data.options;
    this.position = position;

    for (const column of this.grid.columns) {
      this.createCell(column, this.data[column.name]);
    }

    this.cellsByColumnPosition = Object.values(this.cells);
    this.cellsByColumnPosition.sort(cellPositionCompare);

    root((dispose) => {
      this.dispose = dispose;
      if (fixed || (this.options && this.options.allowMergeColumns)) {
        observe(this.mergeColumns);
      }
    });
  }

  get visible(): boolean {
    let visible = true;
    let pRow: IGroupRow | undefined = this.parentRow;
    while (pRow !== undefined) {
      if (!pRow.expanded) {
        visible = false;
        break;
      }
      pRow = pRow.parentRow;
    }

    return visible;
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
  let position = rows.length;

  if (grid.groupBy.length > 0 && !fixed) {
    let root:   IGroupRow;
    let parent: IRows = grid;
    let level = 0;
    for (const column of grid.groupBy) {
      let r = find(parent, column, row);
      if (!r) {
        r = new GroupModel(grid, row, column, level);
        if (parent instanceof GroupModel) {
          r.parentRow = parent;
        }
        parent.rows.push(r);
      }

      if (level === 0) root = r;
      level++;
      parent = r;
    }

    let newRow       = new RowModel(grid, row, undefined, fixed);
    newRow.parentRow = parent as IGroupRow;
    parent.rows.push(newRow);
    grid.dataRowsByPosition.push(newRow);
    return root!;
  }

  let r = new RowModel(grid, row, position, fixed);
  rows.push(r);
  if (!fixed) {
    grid.dataRowsByPosition.push(r);
  }
  return r;
}

export class GroupModel extends RowModel implements IGroupRow {
  rows    : IRow[]  = [];
  expanded: boolean = true;

  constructor(grid: IGrid, data: any, public column: IColumn, public level: number) {
    super(grid, data);
  }
}