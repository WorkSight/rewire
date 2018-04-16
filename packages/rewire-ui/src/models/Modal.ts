import {observable} from 'rewire-core';

export interface ActionOptions {
  type?    : 'submit';
  color?   : 'primary' | 'secondary';
  icon?    : string;
  disabled?: () => boolean;
}

const disabled         = () => false;
export type ActionFn   = () => (Promise<boolean> | boolean);
export type ActionType = {action: () => (Promise<void> | void), type?: 'submit', icon?: string, color?: 'primary' | 'secondary', disabled: () => boolean};

export default class Modal {
  private  state:   {open: boolean, title?: string, enable: boolean};
  readonly actions: {[index: string]: ActionType};

  constructor(title?: string, open?: boolean) {
    this.state   = observable({open: open || false, title, enable: true});
    this.actions = {};
  }

  open() {
    this.state.enable = true;
    this.state.open = true;
  }

  get isOpen() {
    return this.state.open;
  }

  get isDisabled() {
    return !this.state.enable;
  }

  get title() {
    return this.state.title;
  }

  actionFn(label: string) {
    return this.actions[label].action;
  }

  action(label: string, options?: ActionOptions): Modal; // the first two are the overloads the implementation does now show in intellisense!!
  action(label: string, action: ActionFn, options?: ActionOptions): Modal;
  action(label: string, action?: ActionFn | ActionOptions, options?: ActionOptions): Modal {
    if (action && typeof(action) === 'function') {
      this.actions[label] = {action: () => this.dispatch(action), disabled, ...options};
      return this;
    }
    this.actions[label] = {action: () => this.dispatch(undefined), disabled, ...action};
    return this;
  }

  private async dispatch(action?: ActionFn) {
    if (!this.state.enable) return;
    let close = true;
    this.state.enable = false;
    try {
      if (action) close = await action();
    } catch (err) {
      close = false;
    } finally {
      if (close) this.close();
      else this.state.enable = true;
    }
  }

  close = () => {
    this.state.open = false;
  }
}
