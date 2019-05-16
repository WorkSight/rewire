import { useCallback, useEffect, useState, useRef } from 'react'
import S from 's-js';

export function useUnmount(fn: () => void) {
  useEffect(() => fn, []);
}

export function useForceUpdate() {
  const [, setTick] = useState(0);

  const update = useCallback(() => {
      setTick(tick => tick + 1);
  }, [])

  return update;
}

export type ForceUpdateHook = () => () => void;

export interface IUseObserverOptions {
  useForceUpdate?: ForceUpdateHook;
}

class Reaction<T> {
  _dispose?: () => void;
  _result: T;
  _fn: () => T;
  constructor(fn: () => T) {
    this._fn = () => this._result = fn();
  }

  dispose() {
    if(!this._dispose) return;
    this._dispose();
    this._dispose = undefined;
  }

  track(action: () => void): T {
    this.dispose();
    S.root((dispose) => {
      this._dispose = dispose;
      S.on(this._fn, action, undefined, true);
    });
    return this._result;
  }
}

export function useObserver<T>(
  fn: () => T,
  baseComponentName: string = "observed",
  options: IUseObserverOptions = {}
): T {
  const wantedForceUpdateHook = options.useForceUpdate || useForceUpdate;
  const forceUpdate           = wantedForceUpdateHook();
  const s                     = useRef<Reaction<T> | null> (null);
  if (!s.current) {
    s.current = new Reaction<T>(fn);
  }

  useUnmount(() => s.current!.dispose());
  return s.current!.track(forceUpdate);
};
