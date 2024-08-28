import React from 'react';

export type TPercentage = '8.33%' | '16.67%' | '25%' | '33.33%' | '41.67%' | '50%' | '58.33%' | '66.67%' | '75%' | '83.33%' | '91.67%' | '100%';
export type TColumns = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';

export type TAlign = 'top' | 'middle' | 'bottom';

export interface IColProps extends React.HTMLAttributes<any> {
  pct?: TPercentage;
  grow?: TColumns;
  fixed?: string;
  contentAlignment?: TAlign;
  align?: TAlign;
}

const pctMap = {
  '8.33%' : ' col-1',
  '16.67%': ' col-2',
  '25%'   : ' col-3',
  '33.33%': ' col-4',
  '41.67%': ' col-5',
  '50%'   : ' col-6',
  '58.33%': ' col-7',
  '66.67%': ' col-8',
  '75%'   : ' col-9',
  '83.33%': ' col-10',
  '91.67%': ' col-11',
  '100%'  : ' col-12',
};

function _grow(grow?: TColumns) {
  return (grow) ? ` col-grow-${grow}` : '';
}

function _contentAlignment(contentAlignment?: TAlign) {
  return contentAlignment ? ' col-' + contentAlignment : '';
}

function _align(align?: TAlign) {
  return align ? ' col-align-' + align : '';
}

function _percentage(pct?: TPercentage) {
  return (pct) ? pctMap[pct] : '';
}

function _fixed(style: React.CSSProperties, fixed?: string, ) {
  if (fixed) {
    style.width = fixed;
    return ' col-fixed';
  }
  return '';
}

const Col: React.FunctionComponent<IColProps> = ({children, pct, grow, fixed, contentAlignment, align, style}) => {
  style = style || {};
  const cls = `col${_percentage(pct)}${_grow(grow)}${_contentAlignment(contentAlignment)}${_align(align)}${_fixed(style, fixed)}`;

  return (
    <div className={cls} style={style}>
      {children}
    </div>
  );
};

export default Col;
