import * as React from 'react';
import S          from 's-js';

export default class Observe extends React.Component<{render: (observableChanged: boolean) => JSX.Element | JSX.Element[] | null}> {
  private dispose: any;
  private __mounted = false;
  private __observableChanged = false;

  constructor(props: any) {
    super(props);
  }

  componentDidMount() {
    this.__mounted = true;
    if (super.componentDidMount) {
      super.componentDidMount();
    }
  }

  render() {
    if (this.dispose) {
      this.dispose();
      this.dispose = undefined;
    }

    let rendering = true;
    let result;
    S.root((dispose) => {
      this.dispose = dispose;
      S(() => {
        if (rendering) {
          result = this.props.render.call(this, this.__observableChanged);
          this.__observableChanged = false;
          return;
        }
        dispose();
        if (!this.dispose) return;
        this.__observableChanged = true;
        if (this.__mounted) this.forceUpdate();
      });
    });
    rendering = false;
    return result;
  }

  componentWillUnmount() {
    this.__mounted = false;
    if (this.dispose) {
      this.dispose();
      this.dispose = undefined;
    }
    if (super.componentWillUnmount) {
      super.componentWillUnmount();
    }
  }
}

export function disposeOnUnmount(context: any, fn: Function) {
  S.root((dispose) => {
    const oldCWM = context.componentWillUnmount;
    context.componentWillUnmount = () => {
      if (oldCWM) oldCWM.call(context);
      dispose();
    };
    fn();
  });
}