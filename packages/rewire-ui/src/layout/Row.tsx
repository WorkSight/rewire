import * as React from 'react';
import './flexgrid.css';

export type TAlign = 'start' | 'center' | 'end' | 'around' | 'between';

export interface IRowProps extends React.HTMLAttributes<any> {
  align?: TAlign;
  gutter?: boolean;
}

function _align(align?: TAlign) {
  return align ? ' grid-' + align : '';
}

function _gutter(gutter?: boolean) {
  return gutter === false ? ' grid-nogutter' : '';
}

const Row: React.SFC<IRowProps> = ({children, style, align, gutter}) => {
  const cls = `grid${_align(align)}${_gutter(gutter)}`;
  return (
    <div className={cls} style={style}>
      {children}
    </div>
  );
};

export default Row;
