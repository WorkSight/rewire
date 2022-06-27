import * as React              from 'react';
import {Observe}               from 'rewire-core';
import MenuItem                from '@material-ui/core/MenuItem';
import ListItemText            from '@material-ui/core/ListItemText';
import ListItemIcon            from '@material-ui/core/ListItemIcon';
import {Theme}                 from '@material-ui/core/styles';
import LabelIcon               from '@material-ui/icons/LabelOutlined';
import MenuBase, {
  IMenuBaseItem,
  MenuBaseProps,
  MenuBaseStyles,
  IMenuBaseItemRendererProps,
}                              from './MenuBase';
import {WithStyle, withStyles} from './styles';

export interface IActionMenuItem extends IMenuBaseItem {
  isExternalLink?: boolean;
  href?: string;

  onClick?(item: IActionMenuItem): void;
}

export interface IActionMenuItemRendererProps extends IMenuBaseItemRendererProps {
  item: IActionMenuItem;
}

const actionItemRendererStyles = (theme: Theme) => ({
  menuButton: {
  },
  menu: {
  },
  menuTitleContainer: {
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
  },
});

export type ActionMenuItemRendererProps = WithStyle<MenuBaseStyles, IActionMenuItemRendererProps>;

export const ActionItemRenderer = React.memo(withStyles(actionItemRendererStyles, React.forwardRef((props: ActionMenuItemRendererProps, ref: any): JSX.Element => {
  return <Observe render={() => {
    const item         = props.item;
    const visible      = props.visible;
    const disabled     = props.disabled;
    const classes      = props.classes;
    const rootClasses  = props.rootClasses;
    const clickHandler = props.clickHandler;
    let externalLinkProps: any = {};
    if (item.isExternalLink) {
        externalLinkProps.component = 'a';
        externalLinkProps.target    = '_blank';
        externalLinkProps.href      = item.href || '';
    }
    return (
      visible &&
        <MenuItem key={item.name} {...externalLinkProps} divider={item.divider} disableRipple={disabled} classes={{root: rootClasses, selected: classes.menuItemSelected}} onClick={clickHandler}>
          <ListItemIcon className={classes.listItemIcon}>
            {item.icon ? item.icon : <LabelIcon />}
          </ListItemIcon>
          <ListItemText className={classes.listItemText} primary={item.title} primaryTypographyProps={{classes: {root: classes.listItemTypography}}} />
        </MenuItem>
    );
  }} />;
})));

export interface IActionMenuProps extends MenuBaseProps {
  items: IActionMenuItem[];

  onItemClick?(item: IActionMenuItem): void;
}

class ActionMenu extends React.Component<IActionMenuProps> {
  constructor(props: IActionMenuProps) {
    super(props);
  }

  render() {
    return <Observe render={() => (
      <MenuBase itemRenderer={ActionItemRenderer} {...this.props} />
    )} />;
  }
}

export default ActionMenu;
