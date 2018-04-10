import {
  withStyles as withStylesMUI,
  Theme
} from 'material-ui/styles';

export {Theme as Theme};

export type StylesOf<T> = {
  [P in keyof T]: string;
};

export type StyleProps<T> = {
  classes: StylesOf<T>;
  theme: Theme;
};

export interface Func<T> {
  ([...args]: any, args2?: any): T;
}

export function returnType<T>(func: Func<T>) {
  return {} as T;
}

export type WithStyle<T, P = {}> = {style?: React.CSSProperties, children?: React.ReactNode} & StyleProps<T> & P;

export type ComponentProps<T> = <P>(component: React.ComponentType<WithStyle<T, P>>) => React.ComponentType<P>;


export type ThemeFn<T> = (theme: Theme) => T;
export default function decorate<T>(styles: T | ThemeFn<T>): ComponentProps<T> {
  if (typeof styles === 'function') {
    const stylesType = returnType(styles as ThemeFn<T>);
    return withStylesMUI(styles as any, {withTheme: true}) as ComponentProps<typeof stylesType>;
  }
  return withStylesMUI(styles as any, {withTheme: true}) as ComponentProps<T>;
}

export function withStyles<P, T>(styles: T, component: React.ComponentType<WithStyle<T, P>>): React.ComponentType<P> {
  return decorate(styles)<P>(component);
}
