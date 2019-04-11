import * as React              from 'react';
import {Observe}               from 'rewire-core';
import {Theme}                 from '@material-ui/core/styles';
import Button, {ButtonProps}   from '@material-ui/core/Button';
import Menu, {MenuProps}       from '@material-ui/core/Menu';
import MenuItem                from '@material-ui/core/MenuItem';
import ListItemText            from '@material-ui/core/ListItemText';
import ListItemIcon            from '@material-ui/core/ListItemIcon';
import {SvgIconProps}          from '@material-ui/core/SvgIcon';
import CheckIcon               from '@material-ui/icons/Check';
import {WithStyle, withStyles} from './styles';

export interface IToggleMenuItem {
  name:    string;
  title:   string;
  visible: boolean;
  icon?:   React.ComponentType<SvgIconProps>;
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
    marginRight: '0px',
    color: '#669639',
  },
  menuItem: {
    minWidth: '150px',
  },
  menuItemSelected: {
  },
});

interface IToggleMenuProps {
  menuId:        string;
  buttonContent: JSX.Element | string;
  buttonProps:   ButtonProps;
  items:         IToggleMenuItem[];

  onItemClick?(item: IToggleMenuItem): () => void;
}

interface IToggleMenuState {
  anchorEl?: HTMLElement;
}

export type ToggleMenuProps = WithStyle<ReturnType<typeof styles>, MenuProps & IToggleMenuProps>;

class ToggleMenu extends React.Component<ToggleMenuProps, IToggleMenuState> {
  state: IToggleMenuState = {
    anchorEl: undefined,
  };

  constructor(props: ToggleMenuProps) {
    super(props);
  }

  handleItemClick = (item: IToggleMenuItem) => () => {
    item.visible = !item.visible;
  }

  handleMenuClick = (evt: React.MouseEvent<HTMLElement>) => {
    this.setState({anchorEl: evt.currentTarget});
  }

  handleMenuClose = () => {
    this.setState({anchorEl: undefined});
  }

  renderMenuContent = React.memo((): JSX.Element => {
    const {classes, items, onItemClick} = this.props;

    return <Observe render={() => (
      < >
      {items.map((item: IToggleMenuItem) =>
        <MenuItem key={item.name} classes={{root: classes.menuItem, selected: classes.menuItemSelected}} onClick={onItemClick ? onItemClick(item) : this.handleItemClick(item)}>
          <ListItemText className={classes.listItemText} primary={item.title} />
          <Observe render={() => (
            item.visible
              ? <ListItemIcon className={classes.listItemIcon}>
                  {item.icon ? <item.icon /> : <CheckIcon />}
                </ListItemIcon>
              : null
          )} />
        </MenuItem>
      )}
      </>
    )} />;
  });

  render() {
    const {classes, menuId, buttonContent, buttonProps, items, onItemClick, marginThreshold, MenuListProps, ...restProps} = this.props;
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
          marginThreshold={marginThreshold !== undefined ? marginThreshold : 8}
          MenuListProps={{dense: true, disablePadding: true, ...MenuListProps}}
          {...restProps}
        >
          <this.renderMenuContent />
        </Menu>
      </>
    )} />;
  }
}

export default withStyles(styles, ToggleMenu);
