import { useObserver }  from './useObserver';

interface IObserverProps {
  children?(): any;
  render?(): any;
}

export function Observer({ children, render }: IObserverProps) {
  const component = children || render;
  if (typeof component !== 'function') {
    return null;
  }
  return useObserver(component);
}

Observer.displayName = 'Observer';
