import {IColumn, ICell} from '../model/GridTypes';
import * as React       from 'react';
import Observe          from 'rewire-core/Observe';

export interface ICellProps {
  cell: ICell;
}

export default class Column extends React.PureComponent<ICellProps> {
  startOffset : number;
  isResizing  : boolean;
  column      : IColumn;
  node        : HTMLTableHeaderCellElement;

  constructor(props: ICellProps) {
    super(props);
    this.startOffset  = 0;
    this.isResizing   = false;
    this.column       = this.props.cell.column;
  }

  handleMouseUp = (evt: MouseEvent) => {
    if (!this.node) return;
    this.isResizing = false;
    document.removeEventListener('mouseup', this.handleMouseMove, true);
    document.removeEventListener('mousemove', this.handleMouseMove, true);
    evt.preventDefault();
  }

  handleMouseDown = (evt: React.MouseEvent<any>) => {
    if (!this.node) return;
    this.isResizing = true;
    this.startOffset = this.node.offsetWidth - evt.pageX;
    document.addEventListener('mouseup', this.handleMouseUp, true);
    document.addEventListener('mousemove', this.handleMouseMove, true);
    evt.preventDefault();
    evt.stopPropagation();
  }

  handleMouseMove = (evt: MouseEvent) => {
    if (this.isResizing) {
      this.column.width = this.startOffset + evt.pageX + 'px';
    }
    evt.preventDefault();
  }

  handleSort = (evt: React.MouseEvent<any>) => {
    if (evt.ctrlKey) {
      this.column.grid.addSort(this.column, (!this.column.sort || (this.column.sort === 'descending')) ? 'ascending' : 'descending');
    } else {
      this.column.grid.setSort(this.column, (!this.column.sort || (this.column.sort === 'descending')) ? 'ascending' : 'descending');
    }
    evt.preventDefault();
  }

  get value(): string {
    if (this.props.cell.column.map) return this.props.cell.column.map(this.props.cell.value);
    return this.props.cell.value;
  }

  render() {
    return <Observe render={() => {
      let cls = this.column.cls;

      let style: React.CSSProperties = {position: 'relative'};
      if (!this.column.visible) {
        style.display   = 'none';
        style.visibility = 'collapse';
      }

      if (!this.column.enabled) {
        style.color     = '#bbb';
        style.fontStyle = 'italic';
      }

      if (this.column.sort) {
        cls = 'sort ' + this.column.sort;
      }

      return (
        <th className={cls} onMouseDown={this.handleSort} colSpan={this.props.cell.colSpan} ref={(element) => this.node = element as HTMLTableHeaderCellElement} rowSpan={this.props.cell.rowSpan} style={style} title={this.column.tooltip}>{this.value}
          <div onMouseDown={this.handleMouseDown}
            style={{top: 0, right: 0, bottom: 0, width: '5px', position: 'absolute', cursor: 'col-resize'}}>
              &nbsp;
          </div>
        </th>
      );
    }} />;
  }
}
