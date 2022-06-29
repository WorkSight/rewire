import React              from 'react';
import is                 from 'is';
import {Observe}               from 'rewire-core';
import {Theme}                 from '@material-ui/core/styles';
import MenuItem                from '@material-ui/core/MenuItem';
import ListItemText            from '@material-ui/core/ListItemText';
import ListItemIcon            from '@material-ui/core/ListItemIcon';
import {SvgIconProps}          from '@material-ui/core/SvgIcon';
import CheckIcon               from '@material-ui/icons/Check';
import MenuBase, {
  IMenuBaseItem,
  MenuBaseProps,
  IMenuBaseItemRendererProps,
  MenuBaseStyles,
}                              from './MenuBase';
import {WithStyle, withStyles} from './styles';

export interface IToggleMenuItem extends IMenuBaseItem {
  active: boolean | (() => boolean);
  toggleIcon?: (props: SvgIconProps) => JSX.Element | React.ComponentElement<SvgIconProps, any> | null;

  onClick?(item: IToggleMenuItem): void;
}

export interface IToggleMenuItemRendererProps extends IMenuBaseItemRendererProps {
  item: IToggleMenuItem;
}

const toggleItemRendererStyles = (_theme: Theme) => ({
  menuButton: {
  },
  menu: {
  },
  menuTitleContainer: {
  },
  listItemText: {
    marginRight: '16px',
  },
  listItemTypography: {
  },
  listItemIcon: {
    minWidth: '0px',
    marginRight: '16px',
  },
  listItemToggleIcon: {
    minWidth: '0px',
    marginLeft: '16px',
    color: '#669639',
  },
  menuItem: {
  },
  menuItemSelected: {
  },
  menuItemDisabled: {
  },
});

export type ToggleMenuItemRendererProps = WithStyle<MenuBaseStyles, IToggleMenuItemRendererProps>;

export const ToggleItemRenderer = React.memo(withStyles(toggleItemRendererStyles, React.forwardRef((props: ToggleMenuItemRendererProps, _ref: any): JSX.Element => {
  return <Observe render={() => {
    const item         = props.item;
    const visible      = props.visible;
    const disabled     = props.disabled;
    const classes      = props.classes;
    const rootClasses  = props.rootClasses;
    const clickHandler = props.clickHandler;
    return (
      visible &&
        <MenuItem key={item.name} divider={item.divider} classes={{root: rootClasses, selected: classes.menuItemSelected}} disableRipple={disabled} onClick={clickHandler}>
          {item.icon &&
            <ListItemIcon className={classes.listItemIcon}>
              {<item.icon />}
            </ListItemIcon>
          }
          <ListItemText className={classes.listItemText} primary={item.title} primaryTypographyProps={{classes: {root: classes.listItemTypography}}} />
          <Observe render={() => (
            (is.function(item.active) ? (item.active as CallableFunction)() : item.active) &&
              <ListItemIcon className={classes.listItemToggleIcon}>
                {item.toggleIcon ? <item.toggleIcon /> : <CheckIcon />}
              </ListItemIcon>
            || null
          )} />
        </MenuItem>
    );
  }} />;
})));

export interface IToggleMenuProps extends MenuBaseProps {
  items: IToggleMenuItem[];

  onItemClick?(item: IToggleMenuItem): void;
}

class ToggleMenu extends React.Component<IToggleMenuProps> {
  constructor(props: IToggleMenuProps) {
    super(props);
  }

  defaultOnItemClick = (item: IToggleMenuItem) => {
    if (!is.function(item.active)) {
      item.active = !item.active;
    }
  };

  render() {
    const {onItemClick, ...restProps} = this.props;
    return <Observe render={() => (
      <MenuBase itemRenderer={ToggleItemRenderer} onItemClick={onItemClick ? onItemClick : this.defaultOnItemClick} {...restProps} />
    )} />;
  }
}

export default ToggleMenu;
