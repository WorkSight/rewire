import {PureComponent} from 'react';
import {
  IRow,
  IColumn,
  IGroupRow,
  getValue,
  isGroupRow
}                              from '../models/GridTypes';
import * as React              from 'react';
import cc                      from 'classcat';
import classNames              from 'classnames';
import Color                   from 'color';
import {Observe}               from 'rewire-core';
import {Theme}                 from '@material-ui/core/styles';
import {WithStyle, withStyles} from 'rewire-ui';

export interface IRowProps {
  row           : IRow;
  columns       : IColumn[];
  Cell          : React.ComponentClass<any>;
  index         : number;
  visibleColumns: number;
  className?    : string;
}

const styles = (theme: Theme) => {
  let color = theme.palette.groupRowBackground.main;

  let styleObj = {
    group: {
      fontSize: theme.fontSizes.groupRow,
      '&:before': {
        color: Color(color).darken(.45).string(),
      },
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
  handleRowClicked = () => {
    // this.props.row.grid.selectRows([this.props.row]);
  }

  renderCells = () => {
    let cells: JSX.Element[] = [];
    this.props.columns.forEach((column) => {
      // if (!this.props.row.cells) return;
      let cell = this.props.row.cells[column.name];
      let Cell = this.props.Cell;
      if ((cell.colSpan ===  0) || (cell.rowSpan === 0)) return;
        cells.push(<Cell key={cell.id} cell={cell} />);
    });
    return cells;
  }

  renderRow() {
    let className = cc([this.props.className, {selected: this.props.row.selected}, this.props.row.cls, 'tabrow']);
    return (
      <tr className={className} onClick={this.handleRowClicked} >
        {this.renderCells()}
      </tr>
    );
  }

  renderChildRows(groupRow: IGroupRow): React.ReactNode[] | null {
    if (!groupRow.expanded) return null;

    return groupRow.rows.map((r, idx) => <Row key={r.id} row={r} columns={this.props.columns} index={idx} Cell={this.props.Cell} className={((idx % 2) === 1) ? 'alt' : ''} visibleColumns={this.props.visibleColumns} />);
  }

  renderGroupRow(groupRow: IGroupRow) {
    let value: JSX.Element | string | undefined;
    let className: any[] = ['group', 'level-' + groupRow.level];
    if (groupRow.grid.dataColumns === this.props.columns && (groupRow.grid.fixedColumns.length > 0)) {
      value = <span>&nbsp;</span>;
    } else {
      className.push({expanded: groupRow.expanded, collapsed: !groupRow.expanded});
      value = getValue(groupRow, groupRow.column);
    }

    return (
      < >
        <tr>
          <td colSpan={this.props.visibleColumns} className={classNames(cc(className), this.props.classes.group, this.props.classes[`groupLevel${groupRow.level}`])} onClick={() => groupRow.expanded = !groupRow.expanded}>
            <div><span>{value}</span></div>
          </td>
        </tr>
        {this.renderChildRows(groupRow)}
      </>
    );
  }

  render() {
    return <Observe render={() => isGroupRow(this.props.row) ? this.renderGroupRow(this.props.row) : this.renderRow()} />;
  }
});

export default Row;
