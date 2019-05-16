import { ReactElement } from 'react';
import { useObserver } from './useObserver';

interface IObserverProps {
    children?(): ReactElement<any>;
    render?(): ReactElement<any>;
}

export function Observer({ children, render }: IObserverProps) {
    const component = children || render;
    if (typeof component !== 'function') {
        return null;
    }
    return useObserver(component);
}

Observer.displayName = 'Observer';
