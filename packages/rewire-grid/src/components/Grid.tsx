import {IGrid, IColumn}              from '../models/GridTypes';
import Column                        from './Column';
import Cell                          from './Cell';
import Row                           from './Row';
import * as React                    from 'react';
import {
  Observe,
  disposeOnUnmount,
  watch,
  property,
  DataSignal
} from 'rewire-core';
import {KeyHandler}                  from 'rewire-ui';
import {debounce}                    from 'rewire-common';
import './data-grid.scss';

interface IColumnProps {
  column: IColumn;
}

class ColumnWidth extends React.PureComponent<IColumnProps> {
  constructor(props: IColumnProps) {
    super(props);
  }

  render() {
    return <Observe render={() => {
      const column = this.props.column;
      let style: React.CSSProperties = { width: column.width };
      if (!column.visible) {
        style.display    = 'none';
      }

      return <col style={style} />;
    }} />;
  }
}

let _currentWindowSize = property({width: -1, height: -1});
let previous           = {width: 0, height: 0};
window.onresize = (evt) => {
  let current = {width: window.innerWidth, height: window.innerHeight};
  if ((current === previous) || (current && previous && (current.width === previous.width) && (current.height === previous.height)))
    return;

  _currentWindowSize({width: current.width, height: current.height});
  previous = current;
};

export interface IGridProps {
  grid: IGrid;
  virtual?: boolean;
  style?: React.CSSProperties;
}

type BodyType = {grid: IGrid, columns: IColumn[], gridContent: DataSignal<HTMLDivElement | undefined>, scrollY: DataSignal<number>, loadMoreRows?: (args: {start: number, end: number}) => Promise<any[]> };
class Body extends React.PureComponent<BodyType, {offset: number}> {
  constructor(props: BodyType) {
    super(props);
  }

  render() {
    let visibleColumns = this.props.columns.reduce((prev, current) => prev = prev + (current.visible ? 1 : 0), 0);

    return (
      <tbody role='rowgroup'>
        <Observe render={() => this.props.grid.rows.map((row, index) => <Row key={row.id} columns={this.props.columns} Cell={Cell} index={index} visibleColumns={visibleColumns} className={((index % 2) === 1) ? 'alt' : ''} row={row} />)} />
      </tbody>
    );
  }
}

class VirtualBody extends React.PureComponent<BodyType, {offset: number, loading: boolean}> {
  viewportCount = 0;
  visibleColumns = 0;

  constructor(props: BodyType) {
    super(props);
    this.state          = {offset: 0, loading: false};
    this.onScroll       = debounce(this.onScroll, 25, {leading: false});
    this.visibleColumns = this.props.columns.reduce((prev, current) => prev = prev + (current.visible ? 1 : 0), 0);
  }

  async loadMoreRows(offset: number) {
    if (!this.props.loadMoreRows || this.rowCache[offset + this.viewportCount]) return;
    this.setState({loading: true});
    let rows    = await this.props.loadMoreRows({start: offset, end: offset + this.viewportCount});
    let i       = 0;
    for (let r of rows) {
      let rowIdx = i + offset;
      let rr     = this.props.grid.addRow(r);
      this.rowCache[offset + i] = <Row key={rowIdx} columns={this.props.columns} Cell={Cell} index={rowIdx} className={((rowIdx % 2) === 1) ? 'alt' : ''} row={rr} visibleColumns={this.visibleColumns} />;
    }
  }

  onScroll = async () => {
    let   offset  = Math.trunc(this.props.scrollY() / 29);
    if (offset < 0 || this.state.offset === offset) {
      return;
    }
    await this.loadMoreRows(offset);
    this._body!.style.transform = 'translateY(' + (offset * 29) + 'px)';
    this.setState({loading: false, offset});
  }

  componentDidMount() {
    disposeOnUnmount(this, () => {
      watch(this.props.gridContent, () => {
        let gridContent = this.props.gridContent();
        if (!gridContent) return;
        let rows                 = this.props.grid.rows;
        let totalSize            = Math.trunc(rows.length * 29);
        gridContent.style.height = totalSize + 'px';
        this.viewportCount       = Math.trunc(gridContent.parentElement!.clientHeight / 29) + 2;
        this.forceUpdate();
      });

      watch(this.props.scrollY, this.onScroll);
    });
  }

  // needsUpdate = false;
  // shouldComponentUpdate() {
  //   return this.needsUpdate;
  // }
  rowCache: JSX.Element[] = [];

  _body: HTMLTableSectionElement | null;
  renderRows() {
    if (!this._body) return null;
    let result: JSX.Element[] = [];
    let rows    = this.props.grid.rows;
    let offset  = this.state.offset;

    for (let index = 0; index < this.viewportCount; index++) {
      let rowIdx = offset + index;
      if ((rowIdx < 0) || (rowIdx >= rows.length)) continue;

      let cachedRow = this.rowCache[rowIdx];
      if (cachedRow) {
        result.push(cachedRow);
        continue;
      }

      let row   = rows[rowIdx];
      cachedRow = <Row key={rowIdx} className={((rowIdx % 2) === 1) ? 'alt' : ''} Cell={Cell} row={row} index={rowIdx} columns={this.props.columns} visibleColumns={this.visibleColumns} />;
      this.rowCache[rowIdx] = cachedRow;
      result.push(cachedRow);
    }
    return result;
  }

  render() {
    return (
      <tbody ref={(v) => this._body = v} role='rowgroup'>
        <Observe render={() => this.renderRows()} />
      </tbody>
    );
  }
}

export default class Grid extends React.PureComponent<IGridProps> {
  private scrollX            : DataSignal<number>;
  private scrollY            : DataSignal<number>;
  private _gridContent       : DataSignal<HTMLDivElement | undefined>;
  private _columnTableWrapper: HTMLDivElement;
  private _columnTable       : HTMLTableElement;
  private _gridFixed         : HTMLTableElement;

  constructor(props: IGridProps) {
    super(props);
    // this.addShortcut({shortcutKey:'ctrl+c',  preventDefault:false, action:this.props.controller.copy.bind(this.props.controller)});
    // this.addShortcut({shortcutKey:'ctrl+v',  preventDefault:false, action:this.props.controller.paste.bind(this.props.controller)});
    // this.addShortcut({shortcutKey:'home',  preventDefault:false, action:() => {
    //   this.props.controller.selectCell(this.rows[0].cells[0]);
    // }});
    // this.addShortcut({shortcutKey:'end',  preventDefault:false, action:() => {
    //   this.props.controller.selectCell(this.rows[this.rows.length - 1].cells[0]);
    // }});
    disposeOnUnmount(this, () => {
      this._gridContent = property(undefined);
      this.scrollX      = property(0);
      this.scrollY      = property(0);

      watch(() => this.scrollX(), () => {
        if (!this._columnTable) return;
        this._columnTable.style.transform = 'translateX(' + -this.scrollX()  + 'px)';
      });

      watch(() => this.scrollY(), () => {
        if (this._gridFixed) this._gridFixed.style.transform = 'translateY(' + -this.scrollY()  + 'px)';
      });

      watch(_currentWindowSize, () => this.updateForScrollbars());
    });
  }

  handleScroll = (evt: React.UIEvent<any>) => {
    let target: Element = evt.target as Element;
    this.scrollX(target.scrollLeft);
    this.scrollY(target.scrollTop);
  }

  componentDidMount() {
    this.updateForScrollbars();
  }

  updateForScrollbars() {
    let columnWrap = this._columnTableWrapper;
    if (columnWrap.style) {
      let node = this._gridContent() as HTMLElement;
      if (node) {
        let width = Math.round(node.getBoundingClientRect().width);
        columnWrap.style.paddingRight = (width > node.scrollWidth) ? '17px' : '0';
      }
    }
  }

  renderFixedColumnHeaders() {
    if (this.props.grid.fixedColumns.length === 0) {
      return null;
    }

    return (
      <div className='column-wrapper corner-labels'>
        <table role='grid' style={{width: this.props.grid.fixedWidth}}>
          {this.renderColumnGroups(true)}
          <thead role='rowgroup'>
            <Observe render={() => (
              this.props.grid.fixedRows.map((row, index) => <Row key={row.id} Cell={Column} columns={this.props.grid.fixedColumns} index={index} visibleColumns={this.props.grid.fixedColumns.length} row={row} />)
            )} />
          </thead>
        </table>
      </div>
    );
  }

  _fixedColGroups: JSX.Element | undefined;
  _colGroups: JSX.Element | undefined;

  renderColumnGroups(fixed: boolean) {
    if (fixed && this._fixedColGroups) {
      return this._fixedColGroups;
    } else if (this._colGroups) {
      return this._colGroups;
    }

    let groups = this.props.grid.columns.reduce((prev: JSX.Element[], column) => {
      if (column.fixed === fixed) {
        prev.push(<ColumnWidth key={'cg_' + column.id} column={column} />);
      }
      return prev;
    }, []);

    let result = <colgroup>{groups}</colgroup>;
    if (fixed) this._fixedColGroups = result;
    else       this._colGroups = result;
    return result;
  }

  renderFixedColumnData() {
    if (this.props.grid.fixedColumns.length === 0) {
      return null;
    }

    let visibleColumns = this.props.grid.fixedColumns.reduce((prev, current) => prev = prev + (current.visible ? 1 : 0), 0);
    return (
      <div className='left-labels'>
        <table role='grid' ref={(c) => this._gridFixed = c as HTMLTableElement} style={{width: this.props.grid.fixedWidth}}>
          {this.renderColumnGroups(true)}
          <tbody role='rowgroup'>
            {this.props.grid.rows.map((row, index) => <Row key={row.id} row={row} Cell={Cell} columns={this.props.grid.fixedColumns} index={index} visibleColumns={visibleColumns} className={((index % 2) === 1) ? 'alt' : ''} />)}
          </tbody>
        </table>
      </div>
    );
  }

  renderHeaders() {
    return (
      <Observe render={() => (
        <div className='top-labels'>
        {this.renderFixedColumnHeaders()}
        <div className='column-wrapper' ref={(c) => this._columnTableWrapper = c as HTMLDivElement }>
          <table role='grid' ref={(c) => this._columnTable = c as HTMLTableElement} style={{width: this.props.grid.width}}>
            {this.renderColumnGroups(false)}
            <thead role='rowgroup'>
              <Observe render={() => (
                this.props.grid.fixedRows.map((row, index) => <Row key={row.id} Cell={Column} columns={this.props.grid.dataColumns} index={index} visibleColumns={this.props.grid.dataColumns.length} row={row} />)
              )} />
            </thead>
          </table>
        </div>
      </div>
      )} />
    );
  }

  componentDidUpdate() {
    this.updateForScrollbars();
  }

  _body: HTMLTableSectionElement | null;

  renderData() {
    let BodyRenderer = (this.props.virtual) ? VirtualBody : Body;

    return (
      <Observe render={() => (
        <div className='grid-scroll' onScroll={this.handleScroll}>
          {this.renderFixedColumnData()}
          <KeyHandler>{
            (keyboard) => (
              <div className='grid-content' onKeyDown={keyboard.handleKeyDown2} ref={(c: HTMLDivElement) => (keyboard.element = c, this._gridContent(c))}>
              <table role='grid' style={{width: this.props.grid.width}}>
                {this.renderColumnGroups(false)}
                <BodyRenderer grid={this.props.grid} gridContent={this._gridContent} scrollY={this.scrollY} columns={this.props.grid.dataColumns} />
              </table>
            </div>
            )}
          </KeyHandler>
        </div>
      )} />
    );
  }

  render() {
    return (
      <div className='ws-grid' style={this.props.style}>
        {this.renderHeaders()}
        {this.renderData()}
      </div>
    );
  }
}
