import {
  IGrid,
  IColumn,
  IGridColors,
  IGridFontSizes,
  IRow,
  IGroupRow
}                                            from '../models/GridTypes';
import {
  Observe,
  disposeOnUnmount,
  watch,
  property,
  DataSignal,
  computed
}                                            from 'rewire-core';
import ReorderableGridRows                   from './ReorderableGridRows';
import ColumnCell                            from './ColumnCell';
import classNames                            from 'classnames';
import Cell                                  from './Cell';
import Row, {GroupRow}                       from './Row';
import React                                 from 'react';
import Color                                 from 'color';
import {debounce}                            from 'rewire-common';
import {WithStyle, withStyles, MixedMenu}    from 'rewire-ui';
import {PopoverOrigin}                       from '@material-ui/core/Popover';
import {ButtonProps}                         from '@material-ui/core/Button';
import {ThemeProvider, Theme}                from '@material-ui/core/styles';
import SettingsIcon                          from '@material-ui/icons/Settings';
import createGridTheme                       from './GridTheme';
import {scrollBySmooth}                      from '../models/SmoothScroll';
import ResizeObserver                        from 'resize-observer-polyfill';
import { loop }                              from 'dom-loop';
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
      const style: React.CSSProperties = { width: column.width };
      if (!column.visible) {
        style.display    = 'none';
      }

      return <col style={style} />;
    }} />;
  }
}

type ResizeCallback = (height: {clientHeight: number, scrollHeight: number}) => void;
interface IResizeWatcherResult {
  watch(callback: ResizeCallback): void;
}

function verticalResizeWatcher(lifetime: React.Component<any>, element: HTMLElement): IResizeWatcherResult {
  const _previous                    = {scrollHeight: -1, clientHeight: -1};
  const _callbacks: ResizeCallback[] = [];
  loop.read(() => {
    _previous.clientHeight = element.clientHeight;
    _previous.scrollHeight = element.scrollHeight;
    for (const callback of _callbacks) {
      callback(_previous);
    }
  });

  const observer = new ResizeObserver(function() {
    loop.read(() => {      const current = {scrollHeight: element.scrollHeight, clientHeight: element.clientHeight};
      if (current && _previous && (current.scrollHeight === _previous.scrollHeight) === (current.clientHeight === _previous.clientHeight)) return;
      for (const callback of _callbacks) {
        callback(current);
      }
      _previous.clientHeight = current.clientHeight;
      _previous.scrollHeight = current.scrollHeight;
    });
  });

  observer.observe(element);
  const oldCWUM = lifetime.componentWillUnmount;
  lifetime.componentWillUnmount = () => { observer.disconnect(); oldCWUM && oldCWUM(); };
  return { watch(callback: ResizeCallback) { _callbacks.push(callback); } };
}

type BodyType = {grid: IGrid, columns: () => IColumn[], renderRows: (rows: IRow[], columns: () => IColumn[], fixed: boolean) => any, scrollY: DataSignal<number>, rowClasses?: any, cellClasses?: any, loadMoreRows?: (args: {start: number, end: number}) => Promise<any[]> };
class Body extends React.PureComponent<BodyType, {offset: number}> {
  constructor(props: BodyType) {
    super(props);
  }

  render() {
    return (
      <tbody role='rowgroup'>
        {this.props.renderRows(this.props.grid.rows, this.props.columns, false)}
      </tbody>
    );
  }
}

class VirtualBody extends React.PureComponent<BodyType, {offset: number, loading: boolean}> {
  viewportCount = 0;

  constructor(props: BodyType) {
    super(props);
    this.state    = {offset: 0, loading: false};
    this.onScroll = debounce(this.onScroll, 25, {leading: false});
  }

  async loadMoreRows(offset: number) {
    if (!this.props.loadMoreRows || this.rowCache[offset + this.viewportCount]) return;
    this.setState({loading: true});
    const rows    = await this.props.loadMoreRows({start: offset, end: offset + this.viewportCount});
    const i       = 0;
    for (const r of rows) {
      const rowIdx = i + offset;
      const rr     = this.props.grid.addRow(r);
      this.rowCache[offset + i] = <Row key={rowIdx} classes={this.props.rowClasses} cellClasses={this.props.cellClasses} columns={this.props.columns} height={this.props.grid.rowHeight} Cell={Cell} index={rowIdx} className={((rowIdx % 2) === 1) ? 'alt' : ''} row={rr} />;
    }
  }

  onScroll = async () => {
    const offset = Math.trunc(this.props.scrollY() / 30);
    if (offset < 0 || this.state.offset === offset) {
      return;
    }
    await this.loadMoreRows(offset);
    this._body!.style.transform = 'translateY(' + (offset * 30) + 'px)';
    this.setState({loading: false, offset});
  };

  componentDidMount() {
    // disposeOnUnmount(this, () => {
    //   watch(() => this.contentElement, () => {
    //     let gridContent = this.contentElement;
    //     if (!gridContent) return;
    //     let rows                 = this.props.grid.rows;
    //     let totalSize            = Math.trunc(rows.length * 30);
    //     gridContent.style.height = totalSize + 'px';
    //     this.viewportCount       = Math.trunc(gridContent.parentElement!.clientHeight / 30) + 2;
    //     this.forceUpdate();
    //   });

    //   watch(this.props.scrollY, this.onScroll);
    // });
  }

  setBodyRef = (element: HTMLTableSectionElement) => {
    this._body = element as HTMLTableSectionElement;
  };

  rowCache: JSX.Element[] = [];

  _body: HTMLTableSectionElement | null;
  renderRows() {
    if (!this._body) return null;
    const result: JSX.Element[] = [];
    const rows    = this.props.grid.rows;
    const offset  = this.state.offset;

    for (let index = 0; index < this.viewportCount; index++) {
      const rowIdx = offset + index;
      if ((rowIdx < 0) || (rowIdx >= rows.length)) continue;

      let cachedRow = this.rowCache[rowIdx];
      if (cachedRow) {
        result.push(cachedRow);
        continue;
      }

      const row   = rows[rowIdx];
      cachedRow = <Row key={rowIdx} className={((rowIdx % 2) === 1) ? 'alt' : ''} classes={this.props.rowClasses} cellClasses={this.props.cellClasses} height={this.props.grid.rowHeight} Cell={Cell} row={row} index={rowIdx} columns={this.props.columns} />;
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

const gridStyles = () => ({
  root: {
  },
  leftLabels: {
  },
  cornerLabels: {
  },
  topLabels: {
  },
  wsGrid: {
  },
  gridContent: {
  },
  gridScroll: {
  },
  optionsMenuContainer: {
  },
  optionsMenuButton: {
  },
  optionsMenuIcon: {
  },
  optionsMenuMenuItem: {
  },
  optionsMenuTitleContainer: {
  },
  optionsMenuListItemTypography: {
  },
  optionsMenuListItemIcon: {
  },
});

export type GridStyles = ReturnType<typeof gridStyles>;

export interface IGridProps {
  grid: IGrid;
  virtual?: boolean;
  className?: string;
  style?: React.CSSProperties;
  classes?: any;
  rowClasses?: any;
  cellClasses?: any;
  gridColors?: IGridColors;
  gridFontSizes?: IGridFontSizes;
}

export type GridProps = WithStyle<GridStyles, IGridProps>;

class Grid extends React.PureComponent<IGridProps> {
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
    const paletteObj: any = {};
    Object.keys(gridColors).forEach(colorName => {
      paletteObj[colorName] = {main: gridColors[colorName]};
    });

    return (
      <ThemeProvider theme={(outerTheme?: Theme) => createGridTheme({palette: paletteObj, fontSizes: gridFontSizes}, outerTheme)}>
        <GridInternal {...this.props} />
      </ThemeProvider>
    );
  }
}

const internalGridStyles = (theme: Theme) => {
  // firefox consideration for fractional pixels issue
  let bodyFontSizeDigits = Number.parseFloat(theme.fontSizes.body.replace(/[^\d.-]/g, ''));
  const bodyFontSizeUnit   = theme.fontSizes.body.replace(/[\d.-]/g, '');
  if (bodyFontSizeUnit === 'rem') {
    const rootElement = document.documentElement;
    if (rootElement) {
      const rootElementFontSize = window.getComputedStyle(rootElement).getPropertyValue('font-size');
      bodyFontSizeDigits     *= Number.parseFloat(rootElementFontSize.replace(/[^\d.-]/g, ''));
    }
  } else if (bodyFontSizeUnit === 'em') {
    bodyFontSizeDigits *= theme.typography.fontSize;
  }

  const cellContainerLineHeight = `${2 * Math.round(bodyFontSizeDigits)}px`;

  const styleObj = {
    root: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      overflow: 'auto'
    },
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
      position: 'relative',
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
    optionsMenuContainer: {
      position: 'absolute',
      display: 'flex',
      height: '100%',
      alignItems: 'center',
      top: '0px',
      right: '0px',
      zIndex: 1,
    },
    optionsMenuButton: {
      minWidth: '0px',
      padding: '0px 2px 0px 0px',
      fontSize: 'inherit',
      color: theme.palette.gridSettingsIcon.main,
      background: theme.palette.headerBackground.main,
      '&:hover, &:active': {
        background: theme.palette.headerBackground.main,
      },
    },
    optionsMenuIcon: {
      fontSize: '1.5em',
    },
    optionsMenuMenuItem: {
      minWidth: '200px',
      paddingTop: `calc(${theme.fontSizes.toggleMenu} / 2.5)`,
      paddingBottom: `calc(${theme.fontSizes.toggleMenu} / 2.5)`,
      fontSize: 'inherit',
    },
    optionsMenuTitleContainer: {
      fontSize: theme.fontSizes.toggleMenu,
    },
    optionsMenuListItemTypography: {
      fontSize: theme.fontSizes.toggleMenu,
    },
    optionsMenuListItemIcon: {
      '& svg': {
        fontSize: `calc(${theme.fontSizes.toggleMenu} * 1.5)`,
      },
    },
  };
  return styleObj;
};

function getScrollbarWidth() {
  // Creating invisible container
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll'; // forcing scrollbar to appear
  // outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
  document.body.appendChild(outer);

  // Creating inner element and placing it in the container
  const inner = document.createElement('div');
  outer.appendChild(inner);

  // Calculating difference between container's full width and the child width
  const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);

  // Removing temporary elements from the DOM
  outer.parentNode!.removeChild(outer);
  return scrollbarWidth;
}

const _scrollbarWidth: number = getScrollbarWidth();

const GridInternal = withStyles(internalGridStyles, class extends React.PureComponent<IGridProps> {
  private scrollX            : DataSignal<number>;
  private scrollY            : DataSignal<number>;
  private _columnTableWrapper: HTMLDivElement;
  private _columnTable       : HTMLTableElement;
  private _leftLabels        : HTMLDivElement;
  grid                       : IGrid;

  constructor(props: GridProps) {
    super(props);
    this.grid              = props.grid;

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
    });
  }

  handleExternalMouseUp = (_evt: MouseEvent) => {
    if (this.grid.clearSelectionOnBlur && !this.grid.isMouseDown && !this.grid.isReorderingMouseDown) {
      this.grid.clearSelection();
    }

    this.grid.isReorderingMouseDown = false;
    this.grid.isMouseDown           = false;
  };

  handleScroll = (evt: React.UIEvent<any>) => {
    const target: Element = evt.target as Element;
    if (target === this.contentElement) {
      this.scrollX(target.scrollLeft);
      this.scrollY(target.scrollTop);
    } else if (target === this._leftLabels && target.scrollTop !== this.scrollY()) {
      this.contentElement!.scrollTo(this.scrollX(), target.scrollTop);
    }
  };

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
      this.contentElement!.scrollBy(scrollAmount, 0);
      // scrollBySmooth(this.grid.contentElement!, scrollAmount, 0, 150);
      // let variation = this.grid.contentElement!.scrollLeft + scrollAmount;
      // this.grid.contentElement!.scrollTo({left: variation, top: this.grid.contentElement!.scrollTop, behavior: 'auto'});
      // this.grid.contentElement!.scroll(variation, this.grid.contentElement!.scrollTop);
    } else {
      // simulate a vertical scroll on the grid content;
      // scrollBySmooth(this.grid.contentElement!, 0, scrollAmount, 150);
      this.contentElement!.scrollBy(0, scrollAmount);
      // let variation = this.grid.contentElement!.scrollTop + scrollAmount;
      // this.grid.contentElement!.scrollTo({left: this.grid.contentElement!.scrollLeft, top: variation, behavior: 'auto'});
      // this.grid.contentElement!.scroll(this.grid.contentElement!.scrollLeft, variation);
    }
  };

  handleFixedKeyDown = (evt: React.KeyboardEvent<any>) => {
    switch (evt.key) {
      case 'PageUp':
        // this.grid.contentElement!.scrollBy(0, -500);
        scrollBySmooth(this.contentElement!, 0, -500, 100);
        break;
      case 'PageDown':
        // this.grid.contentElement!.scrollBy(0, 500);
        scrollBySmooth(this.contentElement!, 0, 500, 100);
        break;
      default:
        return;
    }

    evt.preventDefault();
    evt.stopPropagation();
  };

  handleMouseDown = (evt: React.MouseEvent<any>) => {
    this.grid.isMouseDown = true;

    if (!evt.shiftKey) {
      this.grid.startCell = undefined;
    }

    evt.preventDefault();
    evt.stopPropagation();
  };

  componentDidMount() {
    verticalResizeWatcher(this, this.contentElement!).watch((value) => {
      if (this._columnTableWrapper && this._columnTableWrapper.style) {
        const node = this.contentElement as HTMLElement;
        if (node) {
          this._columnTableWrapper.style.paddingRight = value.clientHeight < value.scrollHeight ? _scrollbarWidth + 'px' : '0';
        }
      }
    });

    if (this.grid.multiSelect || this.grid.clearSelectionOnBlur) {
      document.addEventListener('mouseup', this.handleExternalMouseUp);
    }
  }

  UNSAFE_componentWillMount() {
    disposeOnUnmount(this, () => this.buildColumnGroups());
  }

  componentWillUnmount() {
    if (this.grid.multiSelect || this.grid.clearSelectionOnBlur) {
      document.removeEventListener('mouseup', this.handleExternalMouseUp);
    }
    this.grid.isMouseDown = false;
  }

  UNSAFE_componentWillReceiveProps(nextProps: GridProps) {
    if (nextProps.grid !== this.grid) {
      this.grid = nextProps.grid;
    }
  }

  setLeftLabelsRef = (element: HTMLDivElement) => {
    this._leftLabels = element as HTMLDivElement;
  };

  setColumnTableWrapperRef = (element: HTMLDivElement) => {
    this._columnTableWrapper = element as HTMLDivElement;
  };

  setColumnTableRef = (element: HTMLTableElement) => {
    this._columnTable = element as HTMLTableElement;
  };

  contentElement: HTMLDivElement;
  setGridContentRef = (element: HTMLDivElement) => {
    if (element && element !== this.contentElement) {
      this.contentElement = element;
    }
  };

  renderFixedColumnHeaders(): JSX.Element | null {
    if (this.props.grid.fixedColumns.length === 0 && !this.props.grid.isReorderable) {
      return null;
    }

    return (
      <div className={classNames('column-wrapper corner-labels', this.props.classes.cornerLabels)}>
        <table role='grid' style={{width: this.props.grid.fixedWidth}}>
          {this.renderColumnGroups(true)}
          <thead role='rowgroup'>
            <Observe render={() => (
              this.props.grid.fixedRows.map((row, index) => <Row key={row.id} classes={this.props.rowClasses} cellClasses={this.props.cellClasses} height={this.props.grid.headerRowHeight} Cell={ColumnCell} columns={() => this.props.grid.fixedColumns} index={index} row={row} isFixedColumnsRow={true} />)
            )} />
          </thead>
        </table>
      </div>
    );
  }

  renderGroups(columns: () => IColumn[], fixed: boolean) {
    const grid   = this.grid;
    const groups = grid.groupRows;
    let numVisibleColumns: number;
    if (!fixed) {
      numVisibleColumns = grid.visibleStandardColumns.length;
    } else {
      numVisibleColumns = grid.isReorderable ? grid.visibleFixedColumns.length + 1 : grid.visibleFixedColumns.length;
    }
    return groups.map((group: IGroupRow) => <GroupRow classes={this.props.rowClasses} cellClasses={this.props.cellClasses} fixed={fixed} key={group.title} group={group} columns={columns} numVisibleColumns={numVisibleColumns} />);
  }

  _fixedColGroups: () => JSX.Element | undefined;
  _colGroups: () => JSX.Element | undefined;
  buildColumnGroups() {
    const fixedComputation = () => {
      const fixedGroupsBase: JSX.Element[] = [];
      if (this.grid.isReorderable) {
        fixedGroupsBase.push(<ColumnWidth key={'cg_' + 'reorderable'} column={{visible: true, width: '40px'} as IColumn} />);
      }
      const fixedGroups = this.props.grid.fixedColumns.reduce((prev: JSX.Element[], column) => {
        prev.push(<ColumnWidth key={'cg_' + column.id} column={column} />);
        return prev;
      }, fixedGroupsBase);
      return <colgroup>{fixedGroups}</colgroup>;
    };
    const standardComputation = () => {
      const standardGroups = this.props.grid.standardColumns.reduce((prev: JSX.Element[], column) => {
        prev.push(<ColumnWidth key={'cg_' + column.id} column={column} />);
        return prev;
      }, []);
      return <colgroup>{standardGroups}</colgroup>;
    };
    this._fixedColGroups = computed(() => { this.props.grid.fixedColumns.length; this.grid.isReorderable; }, fixedComputation, undefined, true);
    this._colGroups      = computed(() => this.props.grid.standardColumns.length, standardComputation, undefined, true);
  }

  renderColumnGroups(fixed: boolean): JSX.Element | undefined {
    if (fixed) {
      return this._fixedColGroups();
    } else {
      return this._colGroups();
    }
  }

  renderRows = (rows: IRow[], columns: () => IColumn[], fixed: boolean) => {
    const grid = this.props.grid;
    if (!grid.groupBy || (grid.groupBy.length === 0)) {
      return <Observe render={() => rows.map((row, index) => <Row key={row.id} classes={this.props.rowClasses} cellClasses={this.props.cellClasses} height={this.props.grid.rowHeight} columns={columns} Cell={Cell} index={index} className={((index % 2) === 1) ? 'alt' : ''} row={row} isFixedColumnsRow={fixed} />)} />;
    }

    return <Observe render={() => this.renderGroups(columns, fixed)} />;
  };

  renderFixedColumnData(): JSX.Element | null {
    if (this.props.grid.fixedColumns.length === 0 && !this.grid.isReorderable) {
      return null;
    }

    return (
      <div className={classNames('left-labels', this.props.classes.leftLabels)} ref={this.setLeftLabelsRef} onWheel={this.handleFixedWheel} onKeyDown={this.handleFixedKeyDown}>
        <table role='grid' style={{width: this.props.grid.fixedWidth, marginBottom: '17px'}}>
          {this.renderColumnGroups(true)}
          <tbody role='rowgroup'>
            {this.renderRows(this.props.grid.rows, () => this.props.grid.fixedColumns, true)}
          </tbody>
        </table>
      </div>
    );
  }

  renderOptionsMenu(): JSX.Element | null {
    if (!this.grid.optionsMenu) {
      return null;
    }

    const {classes}                   = this.props;
    const optionsMenu                 = this.grid.optionsMenu;
    const items                       = optionsMenu.items;
    const defaultTitle                = 'Grid Options';
    const tooltip                     = optionsMenu.tooltip || defaultTitle;
    const title                       = optionsMenu.title || (items && items[0] && items[0].subheader ? undefined : defaultTitle);
    const menuId                      = optionsMenu.menuId || `grid${this.grid.id}-options-menu`;
    const buttonContent               = optionsMenu.buttonContent || <SettingsIcon classes={{root: classes.optionsMenuIcon}}/>;
    const buttonProps: ButtonProps    = {disableRipple: true, ...optionsMenu.buttonProps};
    const anchorOrigin: PopoverOrigin = optionsMenu.anchorOrigin || {vertical: 'top', horizontal: 'right'};
    const transformOrigin             = optionsMenu.transformOrigin || anchorOrigin;
    const onItemClick                 = optionsMenu.onItemClick;

    return <Observe render={() => (
      <div className={classes.optionsMenuContainer}>
        <MixedMenu
          title={title}
          tooltip={tooltip}
          menuId={menuId}
          buttonContent={buttonContent}
          buttonProps={buttonProps}
          items={items}
          classes={{menuButton: classes.optionsMenuButton, menuItem: classes.optionsMenuMenuItem, menuTitleContainer: classes.optionsMenuTitleContainer, listItemTypography: classes.optionsMenuListItemTypography, listItemIcon: classes.optionsMenuListItemIcon} as any}
          anchorOrigin={anchorOrigin}
          transformOrigin={transformOrigin}
          onItemClick={onItemClick}
        />
      </div>
    )} />;
  }

  renderHeaders(): JSX.Element {
    return (
      <Observe render={() => (
        <div className={classNames('top-labels', this.props.classes.topLabels)}>
          {this.renderOptionsMenu()}
          {this.renderFixedColumnHeaders()}
          <div className='column-wrapper' ref={this.setColumnTableWrapperRef}>
            <table role='grid' ref={this.setColumnTableRef}>
              {this.renderColumnGroups(false)}
              <thead role='rowgroup'>
                <Observe render={() => (
                  this.props.grid.fixedRows.map((row, index) => <Row key={row.id} classes={this.props.rowClasses} cellClasses={this.props.cellClasses} height={this.props.grid.headerRowHeight} Cell={ColumnCell} columns={() => this.props.grid.standardColumns} index={index} row={row} />)
                )} />
              </thead>
            </table>
          </div>
        </div>
    )} />
    );
  }

  // shouldComponentUpdate(nextProps, nextState, nextContext) {
  //   return nextProps.grid !== this.props.grid;
  // }

  // componentDidUpdate(prevProps: GridProps) {
  //   if (prevProps.grid !== this.props.grid) {
  //     this.grid = this.props.grid;
  //   }
  // }

  _body: HTMLTableSectionElement | null;

  renderDataReorderable(): JSX.Element {
    return (
      <Observe render={() => (
        <ReorderableGridRows>
          {this.renderData()}
        </ReorderableGridRows>
      )} />
    );
  }

  renderData(): JSX.Element {
    const BodyRenderer = (this.props.virtual) ? VirtualBody : Body;
    return (
      <Observe render={() => (
        <div className={classNames('grid-scroll', this.props.classes.gridScroll)} onScrollCapture={this.handleScroll}>
          {this.renderFixedColumnData()}
          <div className={classNames('grid-content', this.props.classes.gridContent)} ref={this.setGridContentRef}>
            <table role='grid'>
              {this.renderColumnGroups(false)}
              <BodyRenderer grid={this.props.grid} renderRows={this.renderRows} scrollY={this.scrollY} columns={() => this.props.grid.standardColumns} />
            </table>
          </div>
        </div>
      )} />
    );
  }

  render() {
    const {style, className, classes} = this.props;
    return <Observe render={() => (
      <div className={classNames(classes.root, className)} style={{...style}}>
        <div className={classNames('ws-grid', classes.wsGrid)} onMouseDown={(this.grid.multiSelect || this.grid.clearSelectionOnBlur) ? this.handleMouseDown : undefined}>
          {this.renderHeaders()}
          {this.grid.isReorderable ? this.renderDataReorderable() : this.renderData()}
        </div>
      </div>
    )} />;
  }
});

export default withStyles(gridStyles, Grid);
