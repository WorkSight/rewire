import * as React              from 'react';
import {Observe}               from 'rewire-core';
import Button, {ButtonProps}   from '@material-ui/core/Button';
import Menu, {MenuProps}       from '@material-ui/core/Menu';
import MenuItem                from '@material-ui/core/MenuItem';
import ListItemText            from '@material-ui/core/ListItemText';
import ListItemIcon            from '@material-ui/core/ListItemIcon';
import {SvgIconProps}          from '@material-ui/core/SvgIcon';
import {Theme}                 from '@material-ui/core/styles';
import LabelIcon               from '@material-ui/icons/LabelOutlined';
import {WithStyle, withStyles} from './styles';

export interface IActionMenuItem {
  name: string;
  title: string;
  icon?: React.ComponentType<SvgIconProps>;
  divider?: boolean;
  closeOnClick?: boolean;
  isExternalLink?: boolean;
  href?: string;

  onClick?(): void;
}

const styles = (theme: Theme) => ({
  menuButton: {
    minWidth: '0px',
  },
  menu: {
  },
  listItemText: {
  },
  listItemIcon: {
  },
  menuItem: {
  },
  menuItemSelected: {
  },
});

interface IActionMenuProps {
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

  renderMenuContent = React.memo((): JSX.Element => {
    const {classes, items} = this.props;

    return <Observe render={() => (
      < >
      {items.map((item: IActionMenuItem) => {
        let externalLinkProps: any = {};
        if (item.isExternalLink) {
            externalLinkProps.component = 'a';
            externalLinkProps.target    = '_blank';
            externalLinkProps.href      = item.href || '';
        }

        return (
          <MenuItem key={item.name} {...externalLinkProps} divider={item.divider} classes={{root: classes.menuItem, selected: classes.menuItemSelected}} onClick={this.handleItemClick(item)}>
            <ListItemIcon className={classes.listItemIcon}>
              {item.icon ? <item.icon /> : <LabelIcon />}
            </ListItemIcon>
            <ListItemText className={classes.listItemText} primary={item.title} />
          </MenuItem>
        );
      })}
      </>
    )} />;
  });

  render() {
    const {classes, menuId, buttonContent, buttonProps, items, marginThreshold, MenuListProps, ...restProps} = this.props;
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
          marginThreshold={marginThreshold !== undefined ? marginThreshold : 5}
          disableEnforceFocus={true}
          MenuListProps={{dense: true, disablePadding: true, ...MenuListProps}}
          {...restProps}
        >
          <this.renderMenuContent />
        </Menu>
      </>
    )} />;
  }
}

export default withStyles(styles, ActionMenu);
