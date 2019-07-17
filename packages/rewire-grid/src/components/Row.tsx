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
import {isNullOrUndefined}     from 'rewire-common';
import {Observe}               from 'rewire-core';
import {Theme}                 from '@material-ui/core/styles';
import {WithStyle, withStyles} from 'rewire-ui';
import Cell                    from './Cell';
import * as fastdom            from 'fastdom';

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
          <td colSpan={props.visibleColumns} className={cc([props.classes.group, props.classes[`groupLevel${props.group.level}`], 'group', {expanded: (props.group.expanded && props.fixed), collapsed: !props.group.expanded && props.fixed}, 'level-' + props.group.level, props.classes.collapsed])}>
            <div><span>{props.fixed ? props.group.title : ''}</span></div>
          </td>
        </tr>
      )} />
      {props.group.rows.map((r, idx) => {
        if (isGroupRow(r)) {
          return <GroupRow key={r.title} fixed={props.fixed} group={r} columns={props.columns} visibleColumns={props.visibleColumns} />;
        } else {
          return <Row key={r.id} height={r.grid.rowHeight} columns={props.columns} Cell={Cell} index={idx} className={((idx % 2) === 1) ? 'alt' : ''} row={r} />;
        }
      })}
    </>
  );
}));

type RowProps = WithStyle<ReturnType<typeof styles>, IRowProps>;
const rowElementMap = new Map<IRow, HTMLTableRowElement[]>();
function addElement(row: IRow, element: HTMLTableRowElement) {
  const e = rowElementMap.get(row);
  if (!e) rowElementMap.set(row, [element]);
  else e.push(element);
}

function getElements(row: IRow): HTMLTableRowElement[] {
  return rowElementMap.get(row) || [];
}

function removeElement(row: IRow, element: HTMLTableRowElement) {
  const e = rowElementMap.get(row);
  if (!e) return;

  e.splice(e.indexOf(element, 1));
  if (e.length === 0) rowElementMap.delete(row);
}

const Row = withStyles(styles, class extends PureComponent<RowProps, {}> {
  element: React.RefObject<HTMLTableRowElement>;
  observer: MutationObserver;

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
  }

  componentDidMount() {
    addElement(this.props.row, this.element.current!);
    this.calculateInitialHeight();
    if (this.props.height === undefined) {
      this.observer = new MutationObserver(() => this.calculateDynamicHeight());
      this.observer.observe(this.element.current!, { childList: true, subtree: true });
    }
  }

  componentWillUnmount() {
    if (this.observer) {
      this.observer.disconnect();
      delete this.observer;
    }

    removeElement(this.props.row, this.element.current!);
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
    return <Observe render={() => cells} />;
  }

  calculateInitialHeight() {
    const elements = getElements(this.props.row);

    if (!isNullOrUndefined(this.props.height)) {
      for (const e of elements) {
        e.style.height = `${this.props.height}px`;
      }
      return;
    }

    let newHeight = 0;
    fastdom.measure(() => {
      for (const e of elements) {
        newHeight = Math.max(newHeight, e.offsetHeight);
      }
    });

    fastdom.mutate(() => {
      for (const e of elements) {
        e.style.height = `${newHeight}px`;
      }
    });
  }

  calculateDynamicHeight() {
    if (!isNullOrUndefined(this.props.height)) {
      return;
    }

    const elements  = getElements(this.props.row);
    let   newHeight = 0;
    fastdom.measure(() => {
      for (const e of elements) {
        e.style.height = 'auto';
        newHeight = Math.max(newHeight, e.offsetHeight);
      }
    });

    fastdom.mutate(() => {
      for (const e of elements) {
        e.style.height = `${newHeight}px`;
      }
    });
  }

  render() {
    return <Observe render={
      () => {
        const className = cc([this.props.className, {selected: this.props.row.selected}, (this.props.row.visible === false) ?  this.props.classes.hidden : this.props.classes.visible, this.props.row.cls, 'tabrow']);
        return <Observe render={() => (
          <tr className={className} ref={this.element} onClick={this.handleRowClick}>
            {this.renderCells()}
          </tr>
        )} />;
      }
    } />;
  }
});

export default Row;
