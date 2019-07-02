import { useObserver }  from './useObserver';

interface IObserverProps {
  children?(): any;
  render?(): any;
  debug?: boolean
}

export function Observer({ children, render, debug }: IObserverProps) {
  const component = children || render;
  if (typeof component !== 'function') {
    return null;
  }
  return useObserver(component, debug);
}

Observer.displayName = 'Observer';
