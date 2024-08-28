import React       from 'react';
import {
  withStyles as withStylesMUI,
  Theme
}                        from '@material-ui/core/styles';
import { CSSProperties } from '@material-ui/styles';

export type {Theme as Theme};

export type StylesOf<T> = {
  [P in keyof T]?: string;
};

export type StyleProps<T> = {
  classes: StylesOf<T>;
  theme?:  Theme;
};

export type CSSTheme = { [field: string]: CSSProperties };

// export interface Func<T> {
//   ([...args]: any, args2?: any): T;
// }

export type WithStyle<T, P = unknown>     = {style?: React.CSSProperties, children?: React.ReactNode} & StyleProps<T> & P;
export type ComponentProps<T>        = <P>(component: React.ComponentType<WithStyle<T, P>>) => React.ComponentType<P>;
export type ComponentPropType<T>     = T extends ComponentProps<infer U> ? U : T;
export type WithDecorator<T, P = unknown> = WithStyle<ComponentPropType<T>, P>;

export type ThemeFn<T> = (theme: Theme) => T;
export default function decorate<T>(styles: T | ThemeFn<T>): ComponentProps<T> {
  if (typeof styles === 'function') {
    return withStylesMUI(styles as any, {withTheme: true}) as ComponentProps<ReturnType<ThemeFn<T>>>;
  }
  return withStylesMUI(styles as any, {withTheme: true}) as ComponentProps<T>;
}

export function withStyles<P, T>(styles: T | ThemeFn<T>, component: React.ComponentClass<P, unknown> | React.FunctionComponent<P>) {
  return decorate(styles)<P>(component as any) as (p: (WithStyle<T, P> & P) | P) => JSX.Element | React.ComponentElement<(WithStyle<T, P> & P) | P, any>;
}