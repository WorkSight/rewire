import * as React              from 'react';
import {isNullOrUndefined}     from 'rewire-common';
import {Observe}               from 'rewire-core';
import classNames              from 'classnames';
import {Theme}                 from '@material-ui/core/styles';
import Button, {ButtonProps}   from '@material-ui/core/Button';
import Menu, {MenuProps}       from '@material-ui/core/Menu';
import MenuItem                from '@material-ui/core/MenuItem';
import ListItemText            from '@material-ui/core/ListItemText';
import ListItemIcon            from '@material-ui/core/ListItemIcon';
import ListSubheader           from '@material-ui/core/ListSubheader';
import {SvgIconProps}          from '@material-ui/core/SvgIcon';
import CheckIcon               from '@material-ui/icons/Check';
import {WithStyle, withStyles} from './styles';

export interface IToggleMenuItem {
  name:    string;
  title:   string;
  visible: boolean;
  icon?:   React.ComponentType<SvgIconProps>;

  disabled?(): boolean;
}

const styles = (theme: Theme) => ({
  menuButton: {
    minWidth: '0px',
  },
  menu: {
  },
  menuTitleContainer: {
    paddingTop: '8px',
    paddingBottom: '8px',
    lineHeight: '1.75',
    color: 'inherit',
  },
  listItemText: {
  },
  listItemTypography: {
  },
  listItemIcon: {
    marginRight: '0px',
    minWidth: '0px',
    color: '#669639',
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

interface IToggleMenuProps {
  title:         string | JSX.Element | (() => JSX.Element);
  menuId:        string;
  buttonContent: JSX.Element | string;
  buttonProps:   ButtonProps;
  items:         IToggleMenuItem[];

  onItemClick?(item: IToggleMenuItem): void;
}

interface IToggleMenuState {
  anchorEl?: HTMLElement;
}

export type ToggleMenuProps = WithStyle<ReturnType<typeof styles>, Partial<MenuProps> & IToggleMenuProps>;

class ToggleMenu extends React.Component<ToggleMenuProps, IToggleMenuState> {
  state: IToggleMenuState = {
    anchorEl: undefined,
  };

  constructor(props: ToggleMenuProps) {
    super(props);
  }

  handleItemClick = (item: IToggleMenuItem) => {
    item.visible = !item.visible;
  }

  handleMenuClick = (evt: React.MouseEvent<HTMLElement>) => {
    this.setState({anchorEl: evt.currentTarget});
  }

  handleMenuClose = () => {
    this.setState({anchorEl: undefined});
  }

  renderTitle = React.memo((): JSX.Element | null => {
    return <Observe render={() => {
      const {title, classes} = this.props;
      const titleDisplay = typeof title === 'function' ? title() : title;
      return (
        <ListSubheader component='div' className={classes.menuTitleContainer}>
          {titleDisplay}
        </ListSubheader>
      );
    }} />;
  });

  renderMenuContent = React.memo(React.forwardRef((): JSX.Element => {
    return <Observe render={() => {
      const {classes, items, onItemClick} = this.props;
      return (
        < >
        {items.map((item: IToggleMenuItem) => {
          let disabled     = !!(item.disabled && item.disabled());
          let rootClasses  = classNames(classes.menuItem, disabled ? classes.menuItemDisabled : undefined);
          let clickHandler = !disabled ? ( onItemClick ? () => onItemClick(item) : () => this.handleItemClick(item) ) : undefined;
          return (
            <MenuItem key={item.name} classes={{root: rootClasses, selected: classes.menuItemSelected}} disableRipple={disabled} onClick={clickHandler}>
              <ListItemText className={classes.listItemText} primary={item.title} primaryTypographyProps={{classes: {root: classes.listItemTypography}}} />
              <Observe render={() => (
                item.visible
                  ? <ListItemIcon className={classes.listItemIcon}>
                      {item.icon ? <item.icon /> : <CheckIcon />}
                    </ListItemIcon>
                  : null
              )} />
            </MenuItem>
          );
        })}
        </>
      );
    }} />;
  }));

  render() {
    const {classes, menuId, buttonContent, buttonProps, items, onItemClick, marginThreshold, MenuListProps, title, ...restProps} = this.props;
    const {anchorEl} = this.state;

    return <Observe render={() => (
      < >
        <Button
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
          marginThreshold={!isNullOrUndefined(marginThreshold) ? marginThreshold : 8}
          MenuListProps={{dense: true, disablePadding: true, subheader: title ? <this.renderTitle /> : undefined, ...MenuListProps}}
          {...restProps}
        >
          <this.renderMenuContent />
        </Menu>
      </>
    )} />;
  }
}

export default withStyles(styles, ToggleMenu);
