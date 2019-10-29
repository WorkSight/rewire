import * as React              from 'react';
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
  MenuBaseStylesType,
}                              from './MenuBase';
import {WithStyle}             from './styles';

export interface IMixedMenuItemRendererProps extends IMenuBaseItemRendererProps {
  item: IActionMenuItem | IToggleMenuItem;
}

export interface IMixedMenuProps extends MenuBaseProps {
  items: (IActionMenuItem | IToggleMenuItem)[];

  onItemClick?(item: IActionMenuItem | IToggleMenuItem): void;
}

export type MixedMenuItemRendererProps = WithStyle<MenuBaseStylesType, IMixedMenuItemRendererProps>;

class MixedMenu extends React.Component<IMixedMenuProps> {
  constructor(props: IMixedMenuProps) {
    super(props);
  }

  itemRenderer = React.memo(React.forwardRef((props: MixedMenuItemRendererProps, ref: any): JSX.Element => {
    return <Observe render={() => {
      return (
        props.item.hasOwnProperty('visible')
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
