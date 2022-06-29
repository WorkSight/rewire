/* eslint-disable no-prototype-builtins */
import React              from 'react';
import {Observe}               from 'rewire-core';
import {
  IActionMenuItem,
  ActionItemRenderer,
  ActionMenuItemRendererProps,
}                              from './ActionMenu';
import {
  IToggleMenuItem,
  ToggleItemRenderer,
  ToggleMenuItemRendererProps,
}                              from './ToggleMenu';
import MenuBase, {
  MenuBaseProps,
  IMenuBaseItemRendererProps,
  MenuBaseStyles,
}                              from './MenuBase';
import {WithStyle}             from './styles';

export interface IMixedMenuItemRendererProps extends IMenuBaseItemRendererProps {
  item: IActionMenuItem | IToggleMenuItem;
}

export interface MixedMenuProps extends MenuBaseProps {
  items: (IActionMenuItem | IToggleMenuItem)[];

  onItemClick?(item: IActionMenuItem | IToggleMenuItem): void;
}

export type MixedMenuItemRendererProps = WithStyle<MenuBaseStyles, IMixedMenuItemRendererProps>;

class MixedMenu extends React.Component<MixedMenuProps> {
  constructor(props: MixedMenuProps) {
    super(props);
  }

  itemRenderer = React.memo(React.forwardRef((props: MixedMenuItemRendererProps, _ref: any): JSX.Element => {
    return <Observe render={() => {
      return (
        props.item.hasOwnProperty('active')
          ? <ToggleItemRenderer {...props as ToggleMenuItemRendererProps} />
          : <ActionItemRenderer {...props as ActionMenuItemRendererProps} />
      );
    }} />;
  }));

  render() {
    return <Observe render={() => (
      <MenuBase itemRenderer={this.itemRenderer} {...this.props} />
    )} />;
  }
}

export default MixedMenu;
