import * as React                   from 'react';
import * as is                      from 'is';
import {isNullOrUndefined, Without} from 'rewire-common';
import {Observe}                    from 'rewire-core';
import classNames                   from 'classnames';
import Button, {ButtonProps}        from '@material-ui/core/Button';
import Menu, {MenuProps}            from '@material-ui/core/Menu';
import MenuItem                     from '@material-ui/core/MenuItem';
import ListItemText                 from '@material-ui/core/ListItemText';
import ListItemIcon                 from '@material-ui/core/ListItemIcon';
import ListSubheader                from '@material-ui/core/ListSubheader';
import {SvgIconProps}               from '@material-ui/core/SvgIcon';
import {Theme}                      from '@material-ui/core/styles';
import {PopoverOrigin}              from '@material-ui/core/Popover';
import LabelIcon                    from '@material-ui/icons/LabelOutlined';
import {WithStyle, withStyles}      from './styles';

export interface IMenuBaseItem {
  name: string;
  title: string;
  icon?: React.ComponentType<SvgIconProps>;
  divider?: boolean;
  subheader?: string | JSX.Element | (() => JSX.Element);
  closeOnClick?: boolean;
  visible?: boolean | (() => boolean);
  disabled?: boolean | (() => boolean);

  onClick?(item: IMenuBaseItem): void;
}

export interface IMenuBaseItemRendererProps {
  item:          IMenuBaseItem;
  visible:       boolean;
  disabled:      boolean;
  classes:       Record<any, string>;
  rootClasses?:  string;

  clickHandler?(): void;
}

const menuBaseStyles = (theme: Theme) => ({
  menuButton: {
    minWidth: '0px',
  },
  menu: {
  },
  menuTitleContainer: {
    paddingTop: '8px',
    paddingBottom: '8px',
    lineHeight: '1.5',
    color: 'inherit',
  },
  listItemText: {
  },
  listItemTypography: {
  },
  listItemIcon: {
    minWidth: '0px',
    marginRight: '16px',
  },
  menuItem: {
    minWidth: '150px',
  },
  menuItemSelected: {
  },
  menuItemDisabled: {
    opacity: '0.5',
    cursor: 'default',
  },
});

interface IMenuBaseProps extends Without<Partial<MenuProps>, 'title'> {
  tooltip?:         string;
  title?:           string | JSX.Element | (() => JSX.Element);
  menuId:           string;
  buttonContent:    JSX.Element;
  buttonProps?:     ButtonProps;
  anchorOrigin?:    PopoverOrigin;
  transformOrigin?: PopoverOrigin;
  items:            IMenuBaseItem[];
  itemRenderer?:    React.SFC<any>;

  onItemClick?(item: IMenuBaseItem): void;
}

export interface IMenuBaseState {
  anchorEl?: HTMLElement;
}

export type MenuBaseStylesType = ReturnType<typeof menuBaseStyles>;
export type MenuBaseProps      = WithStyle<MenuBaseStylesType, IMenuBaseProps>;

class MenuBase extends React.Component<MenuBaseProps, IMenuBaseState> {
  state: IMenuBaseState = {
    anchorEl: undefined,
  };

  constructor(props: MenuBaseProps) {
    super(props);
  }

  handleItemClick = (item: IMenuBaseItem) => () => {
    if (item.onClick) {
      item.onClick(item);
    } else if (this.props.onItemClick) {
      this.props.onItemClick(item);
    }
    if (item.closeOnClick) {
      this.handleMenuClose();
    }
  }

  handleMenuClick = (evt: React.MouseEvent<HTMLElement>) => {
    this.setState({anchorEl: evt.currentTarget});
  }

  handleMenuClose = () => {
    this.setState({anchorEl: undefined});
  }

  renderTitle = React.memo((props: any): JSX.Element | null => {
    return <Observe render={() => {
      const {classes}    = this.props;
      const {title}      = props;
      const titleDisplay = typeof title === 'function' ? title() : title;
      return (
        <>
        <ListSubheader component='div' className={classes.menuTitleContainer}>
          {titleDisplay}
        </ListSubheader>
        </>
      );
    }} />;
  });

  renderItem = React.memo(React.forwardRef((props: IMenuBaseItemRendererProps, ref: any): JSX.Element => {
    return <Observe render={() => {
      const item         = props.item;
      const visible      = props.visible;
      const disabled     = props.disabled;
      const classes      = props.classes;
      const rootClasses  = props.rootClasses;
      const clickHandler = props.clickHandler;
      return (
        visible &&
          <MenuItem key={item.name} divider={item.divider} disableRipple={disabled} classes={{root: rootClasses, selected: classes.menuItemSelected}} onClick={clickHandler}>
            <ListItemIcon className={classes.listItemIcon}>
              {item.icon ? <item.icon /> : <LabelIcon />}
            </ListItemIcon>
            <ListItemText className={classes.listItemText} primary={item.title} primaryTypographyProps={{classes: {root: classes.listItemTypography}}} />
          </MenuItem>
      );
    }} />;
  }));

  renderMenuContent = React.memo(React.forwardRef((): JSX.Element => {
    return <Observe render={() => {
      const {classes, items, itemRenderer} = this.props as any;
      return (
        < >
        {items.map((item: IMenuBaseItem, idx: number) => {
          let disabled     = !!(item.disabled && is.function(item.disabled) ? (item.disabled as CallableFunction)() : item.disabled);
          let visible      = !!(item.visible && is.function(item.visible) ? (item.visible as CallableFunction)() : !isNullOrUndefined(item.visible) ? item.visible : true);
          let rootClasses  = classNames(classes.menuItem, disabled ? classes.menuItemDisabled : undefined);
          let clickHandler = !disabled ? this.handleItemClick(item) : undefined;
          let subheader    = item.subheader;
          let ItemRenderer = itemRenderer ? itemRenderer : this.renderItem;

          return (
            <React.Fragment key={idx}>
              {subheader && <this.renderTitle title={subheader} />}
              <ItemRenderer item={item} rootClasses={rootClasses} classes={classes} visible={visible} disabled={disabled} clickHandler={clickHandler} />
            </React.Fragment>
          );
        })}
        </>
      );
    }} />;
  }));

  render() {
    const {classes, menuId, buttonContent, buttonProps, items, onItemClick, marginThreshold, MenuListProps, title, tooltip, itemRenderer, ...restProps} = this.props;
    const {anchorEl} = this.state;

    return <Observe render={() => (
      < >
        <Button
          title={tooltip}
          className={classes.menuButton}
          aria-owns={anchorEl ? menuId : undefined}
          aria-haspopup='true'
          onClick={this.handleMenuClick}
          {...buttonProps}
        >
          {buttonContent}
        </Button>
        <Menu
          id={menuId}
          className={classes.menu}
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleMenuClose}
          marginThreshold={!isNullOrUndefined(marginThreshold) ? marginThreshold : 5}
          disableEnforceFocus={true}
          disableAutoFocusItem={true}
          MenuListProps={{dense: true, disablePadding: true, subheader: title ? <this.renderTitle title={title} /> : undefined, ...MenuListProps}}
          {...restProps}
        >
          <this.renderMenuContent />
        </Menu>
      </>
    )} />;
  }
}

export default withStyles(menuBaseStyles, MenuBase);
