import {IGrid, IColumn, IGridColors, IGridFontSizes} from '../models/GridTypes';
import Column                                        from './Column';
import classNames                                    from 'classnames';
import Cell                                          from './Cell';
import Row                                           from './Row';
import * as React                                    from 'react';
import {
  Observe,
  disposeOnUnmount,
  watch,
  property,
  DataSignal
} from 'rewire-core';
import {debounce}                from 'rewire-common';
import Color                     from 'color';
import {MuiThemeProvider, Theme} from '@material-ui/core/styles';
import {WithStyle, withStyles}   from 'rewire-ui';
import createGridTheme           from './GridTheme';
import {scrollBySmooth}          from '../models/SmoothScroll';
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
  className?: string;
  style?: React.CSSProperties;
  gridColors?: IGridColors;
  gridFontSizes?: IGridFontSizes;
}

type BodyType = {grid: IGrid, columns: IColumn[], scrollY: DataSignal<number>, rowElements?: {[s: string]: HTMLTableRowElement}, fixedRowElements?: {[s: string]: HTMLTableRowElement}, loadMoreRows?: (args: {start: number, end: number}) => Promise<any[]> };
class Body extends React.PureComponent<BodyType, {offset: number}> {
  constructor(props: BodyType) {
    super(props);
  }

  render() {
    let visibleColumns = this.props.columns.reduce((prev, current) => prev = prev + (current.visible ? 1 : 0), 0);

    return (
      <tbody role='rowgroup'>
        <Observe render={() => this.props.grid.rows.map((row, index) => <Row key={row.id} rowElements={this.props.rowElements} fixedRowElements={this.props.fixedRowElements} columns={this.props.columns} Cell={Cell} index={index} visibleColumns={visibleColumns} className={((index % 2) === 1) ? 'alt' : ''} row={row} />)} />
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
      this.rowCache[offset + i] = <Row key={rowIdx} rowElements={this.props.rowElements} fixedRowElements={this.props.fixedRowElements} columns={this.props.columns} Cell={Cell} index={rowIdx} className={((rowIdx % 2) === 1) ? 'alt' : ''} row={rr} visibleColumns={this.visibleColumns} />;
    }
  }

  onScroll = async () => {
    let offset = Math.trunc(this.props.scrollY() / 30);
    if (offset < 0 || this.state.offset === offset) {
      return;
    }
    await this.loadMoreRows(offset);
    this._body!.style.transform = 'translateY(' + (offset * 30) + 'px)';
    this.setState({loading: false, offset});
  }

  componentDidMount() {
    disposeOnUnmount(this, () => {
      watch(() => this.props.grid.contentElement, () => {
        let gridContent = this.props.grid.contentElement;
        if (!gridContent) return;
        let rows                 = this.props.grid.rows;
        let totalSize            = Math.trunc(rows.length * 30);
        gridContent.style.height = totalSize + 'px';
        this.viewportCount       = Math.trunc(gridContent.parentElement!.clientHeight / 30) + 2;
        this.forceUpdate();
      });

      watch(this.props.scrollY, this.onScroll);
    });
  }

  setBodyRef = (element: HTMLTableSectionElement) => {
    this._body = element as HTMLTableSectionElement;
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
      cachedRow = <Row key={rowIdx} rowElements={this.props.rowElements} fixedRowElements={this.props.fixedRowElements} className={((rowIdx % 2) === 1) ? 'alt' : ''} Cell={Cell} row={row} index={rowIdx} columns={this.props.columns} visibleColumns={this.visibleColumns} />;
      this.rowCache[rowIdx] = cachedRow;
      result.push(cachedRow);
    }
    return result;
  }

  render() {
    return (
      <tbody ref={this.setBodyRef} role='rowgroup'>
        <Observe render={() => this.renderRows()} />
      </tbody>
    );
  }
}

export default class Grid extends React.PureComponent<IGridProps> {
  private gridColors: IGridColors;
  private gridFontSizes: IGridFontSizes;

  constructor(props: IGridProps) {
    super(props);

    this.gridColors    = props.gridColors    || {};
    this.gridFontSizes = props.gridFontSizes || {};
    if (this.gridColors.headerBackground && !this.gridColors.headerBorder) {
      this.gridColors.headerBorder = Color(this.gridColors.headerBackground).lighten(0.15).string();
    }

    if (this.gridColors.cellSelectedBackground && !this.gridColors.gridBorderSelected) {
      this.gridColors.gridBorderSelected = Color(this.gridColors.cellSelectedBackground).darken(0.12).string();
    }

    if (this.gridColors.rowSelectedBackground) {
      if (!this.gridColors.cellSelectedBackground) {
        this.gridColors.cellSelectedBackground = Color(this.gridColors.rowSelectedBackground).lighten(0.07).string();
      }
      if (!this.gridColors.rowSelectedBorder) {
        this.gridColors.rowSelectedBorder = Color(this.gridColors.rowSelectedBackground).darken(0.12).string();
      }
    }
  }

  render() {
    const gridColors    = this.gridColors;
    const gridFontSizes = this.gridFontSizes;
    let paletteObj: any = {};
    Object.keys(gridColors).forEach(colorName => {
      paletteObj[colorName] = {main: gridColors[colorName]};
    });

    return (
      <MuiThemeProvider theme={createGridTheme({palette: paletteObj, fontSizes: gridFontSizes})}>
        <GridInternal {...this.props} />
      </MuiThemeProvider>
    );
  }
}

const styles = (theme: Theme) => {
  // firefox consideration for fractional pixels issue
  let bodyFontSizeDigits = Number.parseFloat(theme.fontSizes.body.replace(/[^\d.-]/g, ''));
  let bodyFontSizeUnit   = theme.fontSizes.body.replace(/[\d.-]/g, '');
  if (bodyFontSizeUnit === 'rem') {
    let rootElement = document.documentElement;
    if (rootElement) {
      let rootElementFontSize = window.getComputedStyle(rootElement).getPropertyValue('font-size');
      bodyFontSizeDigits     *= Number.parseFloat(rootElementFontSize.replace(/[^\d.-]/g, ''));
    }
  } else if (bodyFontSizeUnit === 'em') {
    bodyFontSizeDigits *= theme.typography.fontSize;
  }

  let cellContainerLineHeight = `${2 * Math.round(bodyFontSizeDigits)}px`;

  let styleObj = {
    leftLabels: {
      backgroundColor: theme.palette.leftLabelBackground.main,
      '& tr.alt': {
        backgroundColor: theme.palette.rowStripedBackground.main,
      },
      '& tr.selected': {
        backgroundColor: theme.palette.rowSelectedBackground.main,
        color: theme.palette.rowSelectedText.main,
        '& td': {
          borderRightColor: theme.palette.rowSelectedBorder.main,
          borderBottomColor: theme.palette.rowSelectedBorder.main,
        },
      },
    },
    cornerLabels: {
      borderColor: theme.palette.headerBorder.main,
      backgroundColor: theme.palette.headerBackground.main,
    },
    topLabels: {
      fontSize: theme.fontSizes.header,
      color: theme.palette.headerText.main,
      borderColor: theme.palette.headerBorder.main,
      backgroundColor: theme.palette.headerBackground.main,
      '& div.sort': {
        '&:after': {
          color: theme.palette.headerText.main,
        },
      },
      '& tr': {
        height: `calc(2.4 * ${theme.fontSizes.header})`,
      },
      '& th': {
        borderColor: theme.palette.headerBorder.main,
        padding: '0px 7px',
      },
    },
    wsGrid: {
      color: theme.palette.gridText.main,
      borderColor: theme.palette.gridBorder.main,
      backgroundColor: theme.palette.gridBackground.main,
      '& tr.selected td, & tr.selected th': {
        '&.selected': {
          borderRightColor: theme.palette.gridBorderSelected.main,
          borderBottomColor: theme.palette.gridBorderSelected.main,
          backgroundColor: theme.palette.cellSelectedBackground.main,
        },
        '&.selectedTopMost': {
          borderTopColor: theme.palette.cellOutline.main,
        },
        '&.selectedRightMost': {
          borderRightColor: theme.palette.cellOutline.main,
        },
        '&.selectedBottomMost': {
          borderBottomColor: theme.palette.cellOutline.main,
        },
        '&.selectedLeftMost': {
          borderLeftColor: theme.palette.cellOutline.main,
        },
      },
      '& td, & .left-labels td.selected': {
        borderTopColor: 'transparent',
        borderRightColor: theme.palette.gridBorder.main,
        borderBottomColor: theme.palette.gridBorder.main,
        borderLeftColor: 'transparent',
        '& .cellContainer': {
          lineHeight: cellContainerLineHeight,
        },
      },
      '& th': {
        borderTopColor: 'transparent',
        borderRightColor: theme.palette.headerBorder.main,
        borderBottomColor: theme.palette.headerBorder.main,
        borderLeftColor: 'transparent',
      },
    },
    gridContent: {
      position: 'relative',
      '& tr.selected': {
        backgroundColor: theme.palette.rowSelectedBackground.main,
        color: theme.palette.rowSelectedText.main,
        '& td': {
          borderRightColor: theme.palette.rowSelectedBorder.main,
          borderBottomColor: theme.palette.rowSelectedBorder.main,
        }
      },
      '& tr.alt': {
        backgroundColor: theme.palette.rowStripedBackground.main,
      },
      '& tr.alt.selected': {
        backgroundColor: theme.palette.rowStripedSelectedBackground.main,
      },
    },
    gridScroll: {
      fontSize: theme.fontSizes.body,
    },
  };
  return styleObj;
};

type GridProps = WithStyle<ReturnType<typeof styles>, IGridProps>;

const GridInternal = withStyles(styles, class extends React.PureComponent<GridProps> {
  private scrollX            : DataSignal<number>;
  private scrollY            : DataSignal<number>;
  private _columnTableWrapper: HTMLDivElement;
  private _columnTable       : HTMLTableElement;
  private _leftLabels        : HTMLDivElement;
  private _rowElements       : {[s: string]: HTMLTableRowElement};
  private _fixedRowElements  : {[s: string]: HTMLTableRowElement};
  grid                       : IGrid;

  constructor(props: GridProps) {
    super(props);
    // this.addShortcut({shortcutKey:'ctrl+c',  preventDefault:false, action:this.props.controller.copy.bind(this.props.controller)});
    // this.addShortcut({shortcutKey:'ctrl+v',  preventDefault:false, action:this.props.controller.paste.bind(this.props.controller)});
    // this.addShortcut({shortcutKey:'home',  preventDefault:false, action:() => {
    //   this.props.controller.selectCell(this.rows[0].cells[0]);
    // }});
    // this.addShortcut({shortcutKey:'end',  preventDefault:false, action:() => {
    //   this.props.controller.selectCell(this.rows[this.rows.length - 1].cells[0]);
    // }});
    this.grid = props.grid;
    this.grid.originalDataRowsByPosition = this.grid.dataRowsByPosition.slice();
    this._rowElements      = {};
    this._fixedRowElements = {};

    disposeOnUnmount(this, () => {
      this.scrollX = property(0);
      this.scrollY = property(0);

      watch(() => this.scrollX(), () => {
        if (!this._columnTable) return;
        this._columnTable.style.transform = 'translateX(' + -this.scrollX()  + 'px)';
      });

      watch(() => this.scrollY(), () => {
        if (this._leftLabels && this._leftLabels.scrollTop !== this.scrollY()) this._leftLabels.scrollTo(this._leftLabels.scrollLeft, this.scrollY());
      });

      watch(_currentWindowSize, () => this.updateForScrollbars());

      watch(() => this.grid.dataRowsByPosition.length, () => {
        this.grid.changed = this.grid.hasChanges();
        this.grid.inError = this.grid.hasErrors();
        setTimeout(() => this.updateForScrollbars(), 0);
      });
    });
  }

  handleMouseUp = (evt: React.MouseEvent<any>) => {
    this.grid.isMouseDown = false;
  }

  handleScroll = (evt: React.UIEvent<any>) => {
    let target: Element = evt.target as Element;
    if (target === this.grid.contentElement) {
      this.scrollX(target.scrollLeft);
      this.scrollY(target.scrollTop);
    } else if (target === this._leftLabels && target.scrollTop !== this.scrollY()) {
      this.grid.contentElement!.scrollTo(this.scrollX(), target.scrollTop);
    }
  }

  handleFixedWheel = (evt: React.WheelEvent) => {
    evt.preventDefault();

    let scrollAmount: number;
    switch (evt.deltaMode) {
      case 2:
        scrollAmount = evt.deltaY * 100;
        break;
      case 1:
        scrollAmount = evt.deltaY * 33;
        break;
      case 0:
      default:
        scrollAmount = evt.deltaY;
        break;
    }

    if (evt.shiftKey) {
      // simulate a horizontal scroll on the grid content;
      this.grid.contentElement!.scrollBy(scrollAmount, 0);
      // scrollBySmooth(this.grid.contentElement!, scrollAmount, 0, 150);
      // let variation = this.grid.contentElement!.scrollLeft + scrollAmount;
      // this.grid.contentElement!.scrollTo({left: variation, top: this.grid.contentElement!.scrollTop, behavior: 'auto'});
      // this.grid.contentElement!.scroll(variation, this.grid.contentElement!.scrollTop);
    } else {
      // simulate a vertical scroll on the grid content;
      // scrollBySmooth(this.grid.contentElement!, 0, scrollAmount, 150);
      this.grid.contentElement!.scrollBy(0, scrollAmount);
      // let variation = this.grid.contentElement!.scrollTop + scrollAmount;
      // this.grid.contentElement!.scrollTo({left: this.grid.contentElement!.scrollLeft, top: variation, behavior: 'auto'});
      // this.grid.contentElement!.scroll(this.grid.contentElement!.scrollLeft, variation);
    }
  }

  handleFixedKeyDown = (evt: React.KeyboardEvent<any>) => {
    switch (evt.key) {
      case 'PageUp':
        // this.grid.contentElement!.scrollBy(0, -500);
        scrollBySmooth(this.grid.contentElement!, 0, -500, 100);
        break;
      case 'PageDown':
        // this.grid.contentElement!.scrollBy(0, 500);
        scrollBySmooth(this.grid.contentElement!, 0, 500, 100);
        break;
      default:
        return;
    }

    evt.preventDefault();
    evt.stopPropagation();
  }

  componentDidMount() {
    this.updateForScrollbars();
    if (this.grid.multiSelect) {
      document.addEventListener('mouseup', this.handleMouseUp);
    }
    if (Object.keys(this._rowElements).length <= 0) {
      return;
    }

    this.updateForRowHeights();
  }

  componentWillUnmount() {
    if (this.grid.multiSelect) {
      this.grid.isMouseDown = false;
      document.removeEventListener('mouseup', this.handleMouseUp);
    }
  }

  componentWillReceiveProps(nextProps: GridProps) {
    if (nextProps.grid !== this.grid) {
      // reset column groups
      this._fixedColGroups = undefined;
      this._colGroups      = undefined;
    }
  }

  updateForScrollbars() {
    let columnWrap = this._columnTableWrapper;
    if (columnWrap.style) {
      let node = this.grid.contentElement as HTMLElement;
      if (node) {
        columnWrap.style.paddingRight = (node.clientHeight < node.scrollHeight) ? '17px' : '0';
      }
    }
  }

  updateForRowHeights() {
    Object.keys(this._fixedRowElements).forEach(rowId => {
      let rowElement = this._rowElements[rowId];
      if (rowElement) {
        let fixedRowElement = this._fixedRowElements[rowId];
        if (rowElement.clientHeight === fixedRowElement.clientHeight) return;
        if (rowElement.clientHeight > fixedRowElement.clientHeight) {
          fixedRowElement.style.height = rowElement.clientHeight + 'px';
        } else {
          rowElement.style.height = fixedRowElement.clientHeight + 'px';
        }
      }
    });
  }

  setLeftLabelsRef = (element: HTMLDivElement) => {
    this._leftLabels = element as HTMLDivElement;
  }

  setColumnTableWrapperRef = (element: HTMLDivElement) => {
    this._columnTableWrapper = element as HTMLDivElement;
  }

  setColumnTableRef = (element: HTMLTableElement) => {
    this._columnTable = element as HTMLTableElement;
  }

  setGridContentRef = (element: HTMLDivElement) => {
    if (element && element !== this.grid.contentElement) {
      this.grid.setContentElement(element);
    }
    // this._gridContent(element as HTMLDivElement);
  }

  renderFixedColumnHeaders() {
    if (this.props.grid.fixedColumns.length === 0) {
      return null;
    }

    return (
      <div className={classNames('column-wrapper corner-labels', this.props.classes.cornerLabels)}>
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
      <div className={classNames('left-labels', this.props.classes.leftLabels)} ref={this.setLeftLabelsRef} onWheel={this.handleFixedWheel} onKeyDown={this.handleFixedKeyDown}>
        <table role='grid' style={{width: this.props.grid.fixedWidth, marginBottom: '17px'}}>
          {this.renderColumnGroups(true)}
          <tbody role='rowgroup'>
            {this.props.grid.rows.map((row, index) => <Row key={row.id} row={row} rowElements={this._rowElements} fixedRowElements={this._fixedRowElements} Cell={Cell} columns={this.props.grid.fixedColumns} isFixedColumnsRow={true} index={index} visibleColumns={visibleColumns} className={((index % 2) === 1) ? 'alt' : ''} />)}
          </tbody>
        </table>
      </div>
    );
  }

  renderHeaders() {
    return (
      <Observe render={() => (
        <div className={classNames('top-labels', this.props.classes.topLabels)}>
        {this.renderFixedColumnHeaders()}
        <div className='column-wrapper' ref={this.setColumnTableWrapperRef}>
          <table role='grid' ref={this.setColumnTableRef}>
            {this.renderColumnGroups(false)}
            <thead role='rowgroup'>
              <Observe render={() => (
                this.props.grid.fixedRows.map((row, index) => <Row key={row.id} Cell={Column} columns={this.props.grid.standardColumns} index={index} visibleColumns={this.props.grid.standardColumns.length} row={row} />)
              )} />
            </thead>
          </table>
        </div>
      </div>
      )} />
    );
  }

  componentDidUpdate(prevProps: GridProps) {
    this.updateForScrollbars();
    if (prevProps.grid !== this.props.grid) {
      this.grid = this.props.grid;
    }
  }

  _body: HTMLTableSectionElement | null;

  renderData(): JSX.Element {
    let BodyRenderer     = (this.props.virtual) ? VirtualBody : Body;
    let rowElements      = this.props.grid.fixedColumns.length > 0 ? this._rowElements : undefined;
    let fixedRowElements = this.props.grid.fixedColumns.length > 0 ? this._fixedRowElements : undefined;

    return (
      <Observe render={() => (
        <div className={classNames('grid-scroll', this.props.classes.gridScroll)} onScroll={this.handleScroll}>
          {this.renderFixedColumnData()}
            <div className={classNames('grid-content', this.props.classes.gridContent)}  ref={this.setGridContentRef}>
              <table role='grid'>
                {this.renderColumnGroups(false)}
                <BodyRenderer grid={this.props.grid} scrollY={this.scrollY} rowElements={rowElements} fixedRowElements={fixedRowElements} columns={this.props.grid.standardColumns} />
              </table>
            </div>
        </div>
      )} />
    );
  }

  render() {
    const {style, className, classes} = this.props;
    const maxHeight = style && style.height !== undefined ? style.height : undefined;

    return (
      <div className={classNames('ws-grid', className, classes.wsGrid)} style={{maxHeight: maxHeight, ...style}}>
        {this.renderHeaders()}
        {this.renderData()}
      </div>
    );
  }
});
