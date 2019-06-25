import { IRow, IGroupRow }  from "./GridTypes";
import { value }            from 'rewire-core';

export default class GroupRowModel implements IGroupRow {
  rows: (IRow | IGroupRow)[];
  private _expanded: any;
  private _visible: any;

  constructor(public title: string, public level: number) {
    this._expanded = value(true);
    this._visible  = value(true);
    this.rows      = [];
  }

  expand() {
    if (this.expanded) return;
    for (const row of this.rows) {
      row.visible = true;
    }
    this.expanded = true;
  }

  collapse() {
    if (!this.expanded) return;
    for (const row of this.rows) {
      row.visible = false;
    }
    this.expanded = false;
  }

  get expanded() {
    return this._expanded();
  }
  set expanded(value: boolean) {
    this._expanded(value);
  }

  get visible() {
    return this._visible();
  }
  set visible(value: boolean) {
    const visible = this.expanded && value;
    for (const row of this.rows) {
      row.visible = visible;
    }
    this._visible(value);
  }
}
