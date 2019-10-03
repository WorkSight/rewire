import * as React              from 'react';
import {Observe}               from 'rewire-core';
import {Theme}                 from '@material-ui/core/styles';
import MenuItem                from '@material-ui/core/MenuItem';
import ListItemText            from '@material-ui/core/ListItemText';
import ListItemIcon            from '@material-ui/core/ListItemIcon';
import CheckIcon               from '@material-ui/icons/Check';
import MenuBase, {
  IMenuBaseItem,
  MenuBaseProps,
  IMenuBaseItemRendererProps,
  MenuBaseStylesType,
}                              from './MenuBase';
import {WithStyle, withStyles} from './styles';

export interface IToggleMenuItem extends IMenuBaseItem {
  visible: boolean;

  onClick?(item: IToggleMenuItem): void;
}

interface IToggleMenuItemRendererProps extends IMenuBaseItemRendererProps {
  item: IToggleMenuItem;
}

const toggleItemRendererStyles = (theme: Theme) => ({
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
    marginRight: '0px',
    color: '#669639',
  },
  menuItem: {
  },
  menuItemSelected: {
  },
  menuItemDisabled: {
  },
});

export type ToggleMenuItemRendererProps = WithStyle<MenuBaseStylesType, IToggleMenuItemRendererProps>;

export const ToggleItemRenderer = React.memo(withStyles(toggleItemRendererStyles, React.forwardRef((props: ToggleMenuItemRendererProps, ref: any): JSX.Element => {
  return <Observe render={() => {
    const item         = props.item;
    const disabled     = props.disabled;
    const classes      = props.classes;
    const rootClasses  = props.rootClasses;
    const clickHandler = props.clickHandler;
    return (
      <MenuItem key={item.name} divider={item.divider} classes={{root: rootClasses, selected: classes.menuItemSelected}} disableRipple={disabled} onClick={clickHandler}>
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
    item.visible = !item.visible;
  }

  render() {
    const {onItemClick, ...restProps} = this.props;
    return <Observe render={() => (
      <MenuBase itemRenderer={ToggleItemRenderer} onItemClick={onItemClick ? onItemClick : this.defaultOnItemClick} {...restProps} />
    )} />;
  }
}

export default ToggleMenu;
