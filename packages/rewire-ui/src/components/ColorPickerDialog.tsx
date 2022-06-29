import React                     from 'react';
import { SketchPicker }          from 'react-color';
import Popover                   from '@material-ui/core/Popover';
import { Theme }                 from '@material-ui/core/styles';
import { withStyles }            from './styles';
import './colorPickerDialog.css';

const styles = (_theme: Theme) => ({
});

export type ColorPickerDialogStyles = ReturnType<typeof styles>;

export interface IColor {
  hex: string;
  rgb: {
    r: number,
    g: number,
    b: number,
    a: number,
  };
  hsl: {
    h: number,
    s: number,
    l: number,
    a: number,
  };
}

export interface IColorPickerDialogProps {
  className?: string;
  isOpen: boolean;
  anchorEl?: HTMLElement | (() => HTMLElement);
  color?: string;
  disableAlpha?: boolean;
  width?: number;

  onOpen?(): void;
  onClose?(evt: object, reason: 'escapeKeyDown' | 'backdropClick'): void;
  onChange?(color: IColor, evt: React.ChangeEvent<any>): void;
  onChangeComplete?(color: IColor, evt: React.ChangeEvent<any>): void;
}

export type ColorPickerDialogProps = IColorPickerDialogProps;

class ColorPickerDialog extends React.Component<ColorPickerDialogProps> {
  constructor(props: ColorPickerDialogProps) {
    super(props);
  }

  render() {
    const {className, disableAlpha, width, color, isOpen, anchorEl, onOpen, onClose, onChange, onChangeComplete} = this.props;
    const defaultStyles = {
      color: {
        width: '42px',
        marginLeft: '6px',
      },
      saturation: {
        marginBottom: '5px',
        paddingBottom: '80%',
      },
    };
    const disableAlphaStyles = {
      color: {
        height: '24px'
      },
      hue: {
        height: '24px',
      },
    };

    return (
      <Popover
        className={className}
        open={isOpen}
        anchorEl={anchorEl}
        onEnter={onOpen}
        onClose={onClose}
        marginThreshold={5}
      >
        <SketchPicker
          color={color}
          onChange={onChange as any}
          onChangeComplete={onChangeComplete as any}
          disableAlpha={disableAlpha}
          width={String(width) || "225px"}
          styles={{default: defaultStyles, disableAlpha: disableAlphaStyles}}
        />
      </Popover>
    );
  }
}

export default withStyles(styles, ColorPickerDialog);