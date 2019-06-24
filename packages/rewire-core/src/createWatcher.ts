import { watch, root } from './observable';

export type WatcherType<T> = (obj?: T, props?: (keyof T)[], act?: any) => void;
export type WatcherTypeFn  = (fn?: () => void, act?: any)              => void;

function _createWatcher<T>(): WatcherType<T> | WatcherTypeFn {
  let disposer: (() => void) | undefined;

  const f = function w(obj: T, props: (keyof T)[], act?: any) {
    disposer && disposer();
    if (!obj) return;

    const isFunction = (typeof obj === 'function');
    if (isFunction) {
      act = props as any;
    }

    root(dispose => {
      disposer = dispose;
      watch(() => {
        if (isFunction) {
          (obj as any)();
        } else {
          for (const key of props) {
            const x = obj[key];
            if (Array.isArray(x)) { x.length; }
          }
        }
      }, () => {
        act(obj);
      });
    });
  };
  return f as WatcherType<T>;
}

export function createWatcher<T>(): WatcherType<T> {
  return _createWatcher() as WatcherType<T>;
}

export function createWatcherFn(): WatcherTypeFn {
  return _createWatcher() as WatcherTypeFn;
}