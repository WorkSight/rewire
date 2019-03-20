import * as React              from 'react';
import {SketchPicker}          from 'react-color';
import Popover                 from '@material-ui/core/Popover';
import {Theme}                 from '@material-ui/core/styles';
import {WithStyle, withStyles} from './styles';

const styles = (theme: Theme) => ({
});

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

interface IColorPickerDialogProps {
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

type ColorPickerDialogProps = WithStyle<ReturnType<typeof styles>, IColorPickerDialogProps>;

class ColorPickerDialog extends React.Component<ColorPickerDialogProps> {
  constructor(props: ColorPickerDialogProps) {
    super(props);
  }

  render() {
    const {classes, className, disableAlpha, width, color, isOpen, anchorEl, onOpen, onClose, onChange, onChangeComplete} = this.props;
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
          onChange={onChange}
          onChangeComplete={onChangeComplete}
          disableAlpha={disableAlpha}
          width={width || 225}
          styles={{default: defaultStyles, disableAlpha: disableAlphaStyles}}
        />
      </Popover>
    );
  }
}

export default withStyles(styles, ColorPickerDialog);