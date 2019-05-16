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

export function isPlainObject(value: any): boolean {
  if (!value || typeof value !== "object") {
      return false;
  }
  const proto = Object.getPrototypeOf(value);
  return !proto || proto === Object.prototype;
}

export type ForceUpdateHook = () => () => void;

export interface IUseObserverOptions {
  useForceUpdate?: ForceUpdateHook;
}

interface IRefState {
  dispose: ((fn?: () => void) => void);
}

function disposer(fn?: () => void) {
  this.__dispose && this.__dispose();
  this.__dispose = fn;
}

export function useObserver<T>(
  fn: () => T,
  baseComponentName: string = "observed",
  options: IUseObserverOptions = {}
): T {
  const wantedForceUpdateHook = options.useForceUpdate || useForceUpdate;
  const forceUpdate           = wantedForceUpdateHook();
  const s                     = useRef<IRefState | null> (null);
  if (!s.current) {
    const x: any = {};
    x.dispose = disposer.bind(x);
    s.current = x;
  }

  const ref = s.current!;
  let rendering = true;
  let result: any;
  S.root((dispose) => {
    ref.dispose(dispose);
    useUnmount(() => {
      ref.dispose();
    });

    S(() => {
      if (rendering) {
        try {
          result = fn();
        } catch (e) {
          ref.dispose();
          throw e;
        }
      } else {
        forceUpdate();
      }
    });
  });
  rendering = false;
  return result;
};
