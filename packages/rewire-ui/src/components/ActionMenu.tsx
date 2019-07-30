import * as React              from 'react';
import {Observe}               from 'rewire-core';
import classNames              from 'classnames';
import Button, {ButtonProps}   from '@material-ui/core/Button';
import Menu, {MenuProps}       from '@material-ui/core/Menu';
import MenuItem                from '@material-ui/core/MenuItem';
import ListItemText            from '@material-ui/core/ListItemText';
import ListItemIcon            from '@material-ui/core/ListItemIcon';
import ListSubheader           from '@material-ui/core/ListSubheader';
import Divider                 from '@material-ui/core/Divider';
import {SvgIconProps}          from '@material-ui/core/SvgIcon';
import {Theme}                 from '@material-ui/core/styles';
import LabelIcon               from '@material-ui/icons/LabelOutlined';
import {isNullOrUndefined}     from 'rewire-common';
import {WithStyle, withStyles} from './styles';

export interface IActionMenuItem {
  name: string;
  title: string;
  icon?: React.ComponentType<SvgIconProps>;
  divider?: boolean;
  closeOnClick?: boolean;
  isExternalLink?: boolean;
  href?: string;

  disabled?(): boolean;
  onClick?(): void;
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
    minWidth: '0px',
    marginRight: '16px',
  },
  menuItem: {
  },
  menuItemSelected: {
  },
  menuItemDisabled: {
    opacity: '0.5',
    cursor: 'default',
  },
});

interface IActionMenuProps {
  title?: string | JSX.Element | (() => JSX.Element);
  menuId: string;
  buttonContent: JSX.Element;
  buttonProps: ButtonProps;
  items: IActionMenuItem[];
}

interface IActionMenuState {
  anchorEl?: HTMLElement;
}

export type ActionMenuProps = WithStyle<ReturnType<typeof styles>, MenuProps & IActionMenuProps>;

class ActionMenu extends React.Component<ActionMenuProps, IActionMenuState> {
  state: IActionMenuState = {
    anchorEl: undefined,
  };

  constructor(props: ActionMenuProps) {
    super(props);
  }

  handleItemClick = (item: IActionMenuItem) => () => {
    item.onClick && item.onClick();
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

  renderTitle = React.memo((): JSX.Element | null => {
    return <Observe render={() => {
      const {title, classes} = this.props;
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

  renderMenuContent = React.memo(React.forwardRef((): JSX.Element => {
    return <Observe render={() => {
      const {classes, items} = this.props;
      return (
        < >
        {items.map((item: IActionMenuItem) => {
          let externalLinkProps: any = {};
          if (item.isExternalLink) {
              externalLinkProps.component = 'a';
              externalLinkProps.target    = '_blank';
              externalLinkProps.href      = item.href || '';
          }
          let disabled     = !!(item.disabled && item.disabled());
          let rootClasses  = classNames(classes.menuItem, disabled ? classes.menuItemDisabled : undefined);
          let clickHandler = !disabled ? this.handleItemClick(item) : undefined;

          return (
            <MenuItem key={item.name} {...externalLinkProps} divider={item.divider} disableRipple={disabled} classes={{root: rootClasses, selected: classes.menuItemSelected}} onClick={clickHandler}>
              <ListItemIcon className={classes.listItemIcon}>
                {item.icon ? <item.icon /> : <LabelIcon />}
              </ListItemIcon>
              <ListItemText className={classes.listItemText} primary={item.title} primaryTypographyProps={{classes: {root: classes.listItemTypography}}} />
            </MenuItem>
          );
        })}
        </>
      );
    }} />;
  }));

  render() {
    const {classes, menuId, buttonContent, buttonProps, items, marginThreshold, MenuListProps, title, ...restProps} = this.props;
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
          marginThreshold={!isNullOrUndefined(marginThreshold) ? marginThreshold : 5}
          disableEnforceFocus={true}
          MenuListProps={{dense: true, disablePadding: true, subheader: title ? <this.renderTitle /> : undefined, ...MenuListProps}}
          {...restProps}
        >
          <this.renderMenuContent />
        </Menu>
      </>
    )} />;
  }
}

export default withStyles(styles, ActionMenu);
