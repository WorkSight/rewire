import React              from 'react';
import {
  IRow,
  IColumn,
  IGroupRow,
  isGroupRow
}                               from '../models/GridTypes';
import cc                       from 'classcat';
import Color               from 'color';
import {isNullOrUndefined}      from 'rewire-common';
import {Observe}                from 'rewire-core';
import {Theme}                  from '@material-ui/core/styles';
import {
  WithStyle,
  withStyles,
}                               from 'rewire-ui';
import Cell                     from './Cell';
import { loop }                 from 'dom-loop';

const styles = (theme: Theme) => {
  const color = theme.palette.groupRowBackground.main;

  const styleObj = {
    group: {
      fontSize: theme.fontSizes.groupRow,
      lineHeight: `calc(1.3 * ${theme.fontSizes.groupRow})`,
      '&:before': {
        color: Color(color).darken(.45).string(),
      },
    },
    visible: {
      visibility: 'visible',
    },
    hidden: {
      visibility: 'collapse',
      height: '0px !important',
    },
  };

  for (let i = 0; i < 7; i++) {
    styleObj[`groupLevel${i}`] = {
      backgroundColor:   Color(color).lighten(i * 0.12).string(),
      borderBottomColor: `${Color(color).lighten(i * 0.12).darken(.15).string()} !important`,
    };
  }

  return styleObj;
};

export type RowStyles = ReturnType<typeof styles>;

export interface IGroupProps  {
  group: IGroupRow,
  columns: () => IColumn[],
  numVisibleColumns: number,
  fixed: boolean,
  classes?: any,
  cellClasses?: any,
}

export type GroupProps = WithStyle<RowStyles, IGroupProps>;

export const GroupRow = React.memo(withStyles(styles, (props: GroupProps) => {
  return (
    < >
      <Observe render={() => (
          <tr onClick={() => props.group.expanded ? props.group.collapse() : props.group.expand()} className={(props.group.visible === false) ? props.classes.hidden : props.classes.visible} style={{height: 28}}>
            <td colSpan={props.numVisibleColumns} className={cc([props.classes.group, props.classes[`groupLevel${props.group.level}`], 'group', {expanded: (props.group.expanded && props.fixed), collapsed: !props.group.expanded && props.fixed}, 'level-' + props.group.level, props.classes.collapsed])}>
              <div><span>{props.fixed ? props.group.title : <>&nbsp;</>}</span></div>
            </td>
          </tr>
      )} />
      {props.group.rows.map((r, idx) => {
        if (isGroupRow(r)) {
          return <GroupRow key={r.title} classes={props.classes} cellClasses={props.cellClasses} fixed={props.fixed} group={r} columns={props.columns} numVisibleColumns={props.numVisibleColumns} />;
        } else {
          return <Row key={r.id} classes={props.classes} cellClasses={props.cellClasses} height={r.grid.rowHeight} columns={props.columns} Cell={Cell} index={idx} className={((idx % 2) === 1) ? 'alt' : ''} row={r} isFixedColumnsRow={props.fixed} groupId={props.group.id} />;
        }
      })}
    </>
  );
}));

const rowElementMap = new Map<IRow, InternalRow[]>();
function addElement(row: IRow, component: InternalRow) {
  const e = rowElementMap.get(row);
  if (!e) rowElementMap.set(row, [component]);
  else e.push(component);
}

function getComponents(row: IRow): InternalRow[] {
  return rowElementMap.get(row) || [];
}

function removeElement(row: IRow, component: InternalRow) {
  const e = rowElementMap.get(row);
  if (!e) return;

  e.splice(e.indexOf(component), 1);
  if (e.length === 0) rowElementMap.delete(row);
}

export interface IRowProps {
  row               : IRow;
  height?           : number;
  columns           : () => IColumn[];
  Cell              : (props: any) => JSX.Element;
  isFixedColumnsRow?: boolean;
  index             : number;
  className?        : string;
  classes?          : any;
  cellClasses?      : any;
  groupId?          : string;
}

export type RowProps = WithStyle<RowStyles, IRowProps>;

class InternalRow extends React.PureComponent<RowProps, unknown> {
  element: React.RefObject<HTMLTableRowElement>;
  observer?: MutationObserver;
  desiredHeight: number = 0;

  constructor(props: RowProps) {
    super(props);
    this.element = React.createRef();
    if (this.props.height !== undefined) {
      return;
    }
  }

  handleRowClick = () => {
    if (this.props.row.onClick) {
      this.props.row.onClick(this.props.row);
    }
  };

  componentDidMount() {
    if (!isNullOrUndefined(this.props.height)) {
      this.element.current!.style.height = `${this.props.height}px`;
      return;
    }

    addElement(this.props.row, this);
    this.calculateInitialHeight();
    this.observer = new MutationObserver(() => this.calculateDynamicHeight());
    this.observer.observe(this.element.current!, { childList: true, subtree: true });
  }

  componentWillUnmount() {
    if (this.observer) {
      this.observer.disconnect();
      delete this.observer;
    }

    removeElement(this.props.row, this);
  }

  renderCells = React.memo((): JSX.Element | null => {
    return <Observe render={() => {
      const hasReorderableCell = this.props.isFixedColumnsRow && this.props.row.grid.isReorderable;
      if (!this.props.row.cells && !hasReorderableCell) return null;
      // this.props.grid.standardColumns      // console.log(this.props.isFixedColumnsRow);
      // const columns = this.props.isFixedColumnsRow ? this.props.row.grid.fixedColumns : this.props.row.grid.standardColumns;

      const cells: JSX.Element[] = [];

      if (hasReorderableCell) {
        if (!this.props.row.fixed) {
          const ReorderableCellRenderer = this.props.row.grid.reorderableCellRenderer;
          cells.push(<ReorderableCellRenderer key={`reorderable-gridRows-cell-${this.props.row.id}`} row={this.props.row} isGridMouseCellSelecting={this.props.row.grid.isMouseDown} groupId={this.props.groupId} />);
        } else {
          cells.push(
            <th
              key={`reorderable-headerRows-cell-${this.props.row.id}`}
              colSpan={1}
              rowSpan={this.props.row.grid.fixedRows.length}
            >
            </th>
          );
        }
      }

      this.props.columns().forEach((column: IColumn) => {
        const cell = this.props.row.cells[column.name];
        const Cell = this.props.Cell;
        if ((cell.colSpan ===  0) || (cell.rowSpan === 0)) return;
          cells.push(<Cell key={cell.id} classes={this.props.cellClasses} cell={cell} onClick={this.handleRowClick} />);
      });
      return cells;
    }} />;
  });

  calculateInitialHeight() {
    const components = getComponents(this.props.row);

    let newHeight = 0;
    loop.read(() => {
      this.desiredHeight = this.element.current ? this.element.current.getBoundingClientRect().height : 0;
      for (const component of components) {
        newHeight = Math.max(newHeight, component.desiredHeight);
      }
    });

    loop.write(() => {
      for (const component of components) {
        if (component.element.current) component.element.current.style.height = `${newHeight}px`;
      }
    });
  }

  calculateDynamicHeight() {
    if (!isNullOrUndefined(this.props.height)) {
      return;
    }

    const components = getComponents(this.props.row);
    let   newHeight  = 0;
    loop.read(() => {
      if (this.element.current) this.element.current.style.height = 'auto';
      this.desiredHeight = this.element.current ? this.element.current.getBoundingClientRect().height : 0;
      for (const component of components) {
        newHeight = Math.max(newHeight, component.desiredHeight);
      }
    });

    loop.write(() => {
      for (const component of components) {
        if (component.element.current) component.element.current.style.height = `${newHeight}px`;
      }
    });
  }

  render() {
    return <Observe render={
      () => {
        const className = cc([this.props.className, {selected: this.props.row.selected}, (this.props.row.visible === false) ?  this.props.classes.hidden : this.props.classes.visible, this.props.row.cls, 'tabrow']);
        return <Observe render={() => (
          <tr className={className} ref={this.element} onClick={this.handleRowClick}>
            <this.renderCells />
          </tr>
        )} />;
      }
    } />;
  }
}

const Row = withStyles(styles, InternalRow);
export default Row;
