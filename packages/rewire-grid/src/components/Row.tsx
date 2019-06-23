import {PureComponent} from 'react';
import {
  IRow,
  IColumn,
}                              from '../models/GridTypes';
import * as React              from 'react';
import cc                      from 'classcat';
import * as Color              from 'color';
import {Observe}               from 'rewire-core';
import {Theme}                 from '@material-ui/core/styles';
import {WithStyle, withStyles} from 'rewire-ui';

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
    notVisible: {
      visibility: 'collapse',
    },
    visible: {
      visibility: 'visible',
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

type IGroupProps = {title: string, rows: JSX.Element[], visibleColumns: number, level: number} & React.Props<any>;
export const GroupRow = React.memo(withStyles(styles, (props: IGroupProps & {classes: any}) => {
  return (
    < >
      <Observe render={() => (
        <tr style={{visibility: true ? 'visible' : 'collapse', height: 28}}>
          <td colSpan={props.visibleColumns} className={cc([props.classes.group, props.classes[`groupLevel${props.level}`], 'group', 'level-' + props.level])}>
            <div><span>{props.title}</span></div>
          </td>
        </tr>
      )} />
      {props.rows}
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

  // handleGroupRowClick = (groupRow: IGroupRow) => () => {
  //   groupRow.expanded = !groupRow.expanded;
  //   this.groupRowExpansion(groupRow, groupRow.expanded);
  // }

  // groupRowExpansion(groupRow: IGroupRow, expanded: boolean) {
  //   groupRow.rows.forEach(row => {
  //     row.visible = expanded;
  //     if (isGroupRow(row)) {
  //       this.groupRowExpansion(row, row.expanded && row.visible);
  //     }
  //   });
  // }

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
          this.props.row.height = height;
        }
      });
    }

    return r.height;
  }

  render() {
    return <Observe render={
      () => {
        const className = cc([this.props.className, {selected: this.props.row.selected, [this.props.classes.notVisible + ' notVisible']: !this.props.row.visible, visible: this.props.row.visible}, this.props.row.cls, 'tabrow']);
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
