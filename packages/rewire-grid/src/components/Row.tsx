import {PureComponent} from 'react';
import {
  IRow,
  IColumn,
  IGroupRow,
  isGroupRow
}                              from '../models/GridTypes';
import * as React              from 'react';
import cc                      from 'classcat';
import * as Color              from 'color';
import {Observe}               from 'rewire-core';
import {Theme}                 from '@material-ui/core/styles';
import {WithStyle, withStyles} from 'rewire-ui';
import Cell                    from './Cell';

export interface IRowProps {
  row               : IRow;
  height?           : number;
  columns           : IColumn[];
  Cell              : React.ComponentType<any>;
  isFixedColumnsRow?: boolean;
  index             : number;
  className?        : string;
}

const styles = (theme: Theme) => {
  let color = theme.palette.groupRowBackground.main;

  let styleObj = {
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

type IGroupProps = {group: IGroupRow, columns: IColumn[], visibleColumns: number, fixed: boolean} & React.Props<any>;

export const GroupRow = React.memo(withStyles(styles, (props: IGroupProps & {classes?: any}) => {
  return (
    < >
      <Observe render={() => (
        <tr onClick={() => props.group.expanded ? props.group.collapse() : props.group.expand()} className={(props.group.visible === false) ? props.classes.hidden : props.classes.visible} style={{height: 28}}>
          <td colSpan={props.visibleColumns} className={cc([props.classes.group, props.classes[`groupLevel${props.group.level}`], 'group', 'level-' + props.group.level, props.classes.collapsed])}>
            <div><span>{props.fixed ? props.group.title : ''}</span></div>
          </td>
        </tr>
      )} />
      {props.group.rows.map((r, idx) => {
        if (isGroupRow(r)) {
          return <GroupRow key={r.title} fixed={props.fixed} group={r} columns={props.columns} visibleColumns={props.visibleColumns} />
        } else {
          return <Row key={r.id} height={r.grid.rowHeight} columns={props.columns} Cell={Cell} index={idx} className={((idx % 2) === 1) ? 'alt' : ''} row={r} />;
        }
      })}
    </>
  );
}));

type RowProps = WithStyle<ReturnType<typeof styles>, IRowProps>;

const Row = withStyles(styles, class extends PureComponent<RowProps, {}> {
  element: React.RefObject<HTMLTableRowElement>;

  constructor(props: RowProps) {
    super(props);
    this.element = React.createRef();
  }

  handleRowClick = () => {
    if (this.props.row.onClick) {
      this.props.row.onClick(this.props.row);
    }
  }

  renderCells = () => {
    if (!this.props.row.cells) return [];

    let cells: JSX.Element[] = [];
    this.props.columns.forEach((column: IColumn) => {
      let cell = this.props.row.cells[column.name];
      let Cell = this.props.Cell;
      if ((cell.colSpan ===  0) || (cell.rowSpan === 0)) return;
        cells.push(<Cell key={cell.id} cell={cell} onClick={this.handleRowClick} />);
    });
    return cells;
  }

  recomputeHeight() {
    const r: any = this.props.row;
    if (this.props.height !== undefined) {
      return this.props.height;
    }

    if (r.__computed) return r.__computed;

    const el: any = this.element.current;
    if (!r.__computed && el && !el.__pendingClientRect) {
      el.__pendingClientRect = true;
      requestAnimationFrame(() => {
        const height = (r.__computed = el!.getBoundingClientRect().height);
        el!.__pendingClientRect = false;
        if (height > this.props.row.height) {
          this.props.row.height  = height;
        }
      });
    }

    return r.height;
  }

  render() {
    return <Observe render={
      () => {
        const className = cc([this.props.className, {selected: this.props.row.selected}, (this.props.row.visible === false) ?  this.props.classes.hidden : this.props.classes.visible, this.props.row.cls, 'tabrow']);
        const height    = this.recomputeHeight();

        if (height > this.props.row.height) {
          this.props.row.height = height;
        }

        return (
          <Observe render={() => (
            <tr className={className} ref={this.element} onClick={this.handleRowClick} style={{height: this.props.row.height}}>
              {this.renderCells()}
            </tr>
          )}/>
        );
      }
    } />;
  }
});

export default Row;
