import { useEffect, useState, useRef } from 'react';
import S from 's-js';

export function useUnmount(fn: () => void) {
  useEffect(() => fn, []);
}

class Reaction<T> {
  _dispose?: () => void;
  _result: T;

  dispose() {
    if (!this._dispose) return;
    this._dispose();
    this._dispose = undefined;
  }

  track(fn: () => T, action: () => void): T {
    this.dispose();
    let alreadyRendered = false;
    S.root((dispose) => {
      this._dispose = dispose;
      S.on(() => {
        if (alreadyRendered) return this._result;
        this._result = fn();
        alreadyRendered = true;
      }, action, undefined, true);
    });
    return this._result;
  }
}

export function useObserver<T>(
  renderFn: () => T
): T {
  const [, setTick] = useState(0);
  const update      = () => setTick(tick => tick + 1);
  const s           = useRef<Reaction<T> | null>(null);
  if (!s.current) {
    s.current = new Reaction<T>();
  }

  useUnmount(() => s.current!.dispose());
  return s.current!.track(renderFn, update);
};

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