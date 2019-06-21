import {PureComponent} from 'react';
import {
  IRow,
  IColumn,
  IGroupRow,
  getValue,
  isGroupRow,
}                              from '../models/GridTypes';
import * as React              from 'react';
import cc                      from 'classcat';
import classNames              from 'classnames';
import * as Color              from 'color';
import {Observe}               from 'rewire-core';
import {Theme}                 from '@material-ui/core/styles';
import {WithStyle, withStyles} from 'rewire-ui';

export interface IRowProps {
  row               : IRow;
  columns           : IColumn[];
  Cell              : React.ComponentType<any>;
  isFixedColumnsRow?: boolean;
  index             : number;
  visibleColumns    : number;
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

type RowProps = WithStyle<ReturnType<typeof styles>, IRowProps>;

const Row = withStyles(styles, class extends PureComponent<RowProps, {}> {
  element: React.RefObject<HTMLTableRowElement>;

  constructor(props: RowProps) {
    super(props);
    this.element = React.createRef();
  }

  componentWillUnmount() {
    if (isGroupRow(this.props.row)) {
      return;
    }
  }

  componentDidMount() {
    if (isGroupRow(this.props.row)) {
      return;
    }
  }

  handleRowClick = () => {
    if (this.props.row.onClick) {
      this.props.row.onClick(this.props.row);
    }
  }

  handleGroupRowClick = (groupRow: IGroupRow) => () => {
    groupRow.expanded = !groupRow.expanded;
    this.groupRowExpansion(groupRow, groupRow.expanded);
  }

  groupRowExpansion(groupRow: IGroupRow, expanded: boolean) {
    groupRow.rows.forEach(row => {
      row.visible = expanded;
      if (isGroupRow(row)) {
        this.groupRowExpansion(row, row.expanded && row.visible);
      } else {
        // while cell row bug exists, need to do this.
        row.cellsByColumnPosition.forEach(cell => {
          cell.row.visible = expanded;
        });
      }
    });
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

  renderRow() {
    const className = cc([this.props.className, {selected: this.props.row.selected, [this.props.classes.notVisible + ' notVisible']: !this.props.row.visible, visible: this.props.row.visible}, this.props.row.cls, 'tabrow']);
    if (this.element.current) {
      const height = Math.ceil(this.element.current.getBoundingClientRect().height);
      if (height > this.props.row.height) {
        this.props.row.height = height;
      }
    }

    return (
      <Observe render={() => (
        <tr className={className} ref={this.element} onClick={this.handleRowClick} style={{height: this.props.row.height}}>
          {this.renderCells()}
        </tr>
      )}/>
    );
  }

  renderChildRows(groupRow: IGroupRow): React.ReactNode[] | null {
    return groupRow.rows.map((r, idx) => <Row key={r.id} row={r} columns={this.props.columns} index={idx} Cell={this.props.Cell} isFixedColumnsRow={this.props.isFixedColumnsRow} className={((idx % 2) === 1) ? 'alt' : ''} visibleColumns={this.props.visibleColumns} />);
  }

  renderGroupRow(groupRow: IGroupRow) {
    let value: JSX.Element | string | undefined;
    let className: any[] = ['group', 'level-' + groupRow.level];
    if (groupRow.grid.standardColumns === this.props.columns && (groupRow.grid.fixedColumns.length > 0)) {
      value = <span>&nbsp;</span>;
    } else {
      className.push({expanded: groupRow.expanded, collapsed: !groupRow.expanded});
      value = getValue(groupRow, groupRow.column);
    }

    return (
      < >
        <Observe render={() => (
          <tr style={{visibility: groupRow.visible ? 'visible' : 'collapse', height: this.props.row.height}}>
            <td colSpan={this.props.visibleColumns} className={classNames(cc(className), this.props.classes.group, this.props.classes[`groupLevel${groupRow.level}`])} onClick={this.handleGroupRowClick(groupRow)}>
              <div><span>{value}</span></div>
            </td>
          </tr>
        )} />
        {this.renderChildRows(groupRow)}
      </>
    );
  }

  render() {
    return <Observe render={() => isGroupRow(this.props.row) ? this.renderGroupRow(this.props.row) : this.renderRow()} />;
  }
});

export default Row;
