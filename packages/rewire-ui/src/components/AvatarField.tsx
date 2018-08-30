import * as React from 'react';
import classNames from 'classnames';
import {default as MuiAvatar} from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import {withStyles, WithStyle} from './styles';
import AvatarCropper, {IAvatarCropperProps, generateHash} from './AvatarCropper';

const styles = () => ({
  avatarContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '0 auto',
  },
  changeImageButton: {
    margin: '0 auto',
    position: 'relative',
  },
  muiAvatar: {
    marginBottom: '15px',
  },
  button: {
  },
  changeImageButtonInnerLabel: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    background: 'transparent',
    cursor: 'pointer',
  },
  changeImageButtonInnerInput: {
    width: 0.1,
    height: 0.1,
    opacity: 0,
    overflow: 'hidden',
    position: 'absolute',
    zIndex: -1,
  },
});

export interface IAvatarFieldProps {
  visible?     : boolean;
  classes?     : React.CSSProperties;
  value?       : string;
  onValueChange: (v: string) => void;
}

interface IAvatarFieldState {
  value?: string;
  originalValue?: string;
  loadedValue?: string;
}

type AvatarFieldProps = WithStyle<ReturnType<typeof styles>, IAvatarFieldProps & IAvatarCropperProps>;

class AvatarField extends React.Component<AvatarFieldProps, IAvatarFieldState> {
  state: IAvatarFieldState;

  constructor(props: AvatarFieldProps) {
    super(props);
    this.state = {
      value: this.props.value,
      originalValue: this.props.value,
      loadedValue: undefined,
    };
  }

  shouldComponentUpdate(nextProps: IAvatarFieldProps, nextState: IAvatarFieldState) {
    return (
      (nextProps.value !== this.props.value) ||
      (nextProps.visible !== this.props.visible) ||
      (nextState.value !== this.state.value) ||
      (nextState.loadedValue !== this.state.loadedValue)
    );
  }

  onFileLoad = (file: any) => {
    this.props.onFileLoad && this.props.onFileLoad(file);
  }

  onCrop = (imageSrc: string) => {
    this.props.onCrop && this.props.onCrop(imageSrc);
  }

  onImage = (image: HTMLImageElement) => {
    this.props.onCrop && this.props.onCrop(image);
  }

  onSave = (imageSrc: string) => {
    this.props.onValueChange(imageSrc);
    this.setState({value: imageSrc, loadedValue: undefined, originalValue: imageSrc});
    this.props.onSave && this.props.onSave(imageSrc);
  }

  onCancel = () => {
    this.setState({value: this.state.originalValue, loadedValue: undefined});
    this.props.onCancel && this.props.onCancel();
  }

  handleFileLoad = (e: any) => {
    e.preventDefault();

    let reader = new FileReader();
    let file   = e.target && e.target.files[0];
    this.onFileLoad(file);

    let imageSrc: string;
    reader.onloadend = () => {
      imageSrc = reader.result as string;
      this.setState({value: undefined, loadedValue: imageSrc});
    };
    reader.readAsDataURL(file);
  }

  render() {
    if (this.props.visible === false) {
      return null;
    }

    const {classes, buttonSize, width, height, imageWidth, imageHeight, avatarDiameter, label, lineWidth, cropColor, backgroundColor, shadingColor, shadingOpacity, cropRadius, minCropRadius, mimeTypes} = this.props;
    const bSize    = buttonSize || 'small';
    const mTypes   = mimeTypes || 'image/jpeg,image/png';
    const diameter = (avatarDiameter || 150);

    if (this.state.value) {
      const diameterStr = diameter + 'px';
      const fileInputId    = generateHash('changeImageButtonInnerInput');
      const fileInputProps = {
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => this.handleFileLoad(e),
        name: fileInputId,
        type: 'file',
        id: fileInputId,
        className: classes.changeImageButtonInnerInput,
        accept: mTypes,
      };

      return (
        <div className={classes.avatarContainer}>
          <MuiAvatar src={this.state.value} className={classes.muiAvatar} style={{width: diameterStr, height: diameterStr}} />
          <Button variant='contained' size={bSize} className={classNames(classes.button, classes.changeImageButton)}>
            <span>Change Image</span>
            <label className={classes.changeImageButtonInnerLabel} htmlFor={fileInputId} />
            <input {...fileInputProps} />
          </Button>
        </div>
      );
    }

    const {avatarContainer, changeImageButton, muiAvatar, changeImageButtonInnerLabel, changeImageButtonInnerInput, ...avatarCropperClasses} = classes;
    let containerWidth = width ? width : 300;

    return (
      <div className={classes.avatarContainer}>
        <AvatarCropper
          classes={avatarCropperClasses}
          avatarDiameter={diameter}
          buttonSize={bSize}
          width={containerWidth}
          height={height || containerWidth}
          imageWidth={imageWidth}
          imageHeight={imageHeight}
          lineWidth={lineWidth || 3}
          cropColor={cropColor}
          backgroundColor={backgroundColor}
          shadingColor={shadingColor}
          shadingOpacity={shadingOpacity}
          label={label || 'Upload Image'}
          cropRadius={cropRadius || 75}
          minCropRadius={minCropRadius || 40}
          mimeTypes={mTypes}
          onCrop={this.onCrop}
          onFileLoad={this.onFileLoad}
          onSave={this.onSave}
          onCancel={this.onCancel}
          src={this.state.loadedValue}
        />
      </div>
    );
  }
}

export default withStyles(styles, AvatarField);
