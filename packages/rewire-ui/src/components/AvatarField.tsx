import * as React                                         from 'react';
import classNames                                         from 'classnames';
import {default as MuiAvatar}                             from '@material-ui/core/Avatar';
import Button                                             from '@material-ui/core/Button';
import {withStyles, WithStyle}                            from './styles';
import AvatarCropper, {IAvatarCropperProps, generateHash} from './AvatarCropper';

/*************** AvatarField ***************/

const avatarFieldStyles = () => ({
  avatarContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '0 auto',
  },
});

export interface IAvatarFieldProps {
  visible?       : boolean;
  classes?       : React.CSSProperties;
  value?         : string;
  avatarDiameter?: number;
  mimeTypes?     : string;
  label?         : string;
  onFileLoad?    : (data: any) => void;
  onImageLoad?   : (data: any) => void;
  onValueChange  : (v: string) => void;
}

interface IAvatarFieldState {
  value?: string;
  loadedValue?: string;
}

type AvatarFieldProps = WithStyle<ReturnType<typeof avatarFieldStyles>, IAvatarFieldProps & IAvatarCropperProps>;

class AvatarField extends React.Component<AvatarFieldProps, IAvatarFieldState> {
  state: IAvatarFieldState;
  defaultAvatarFieldProps = {
    buttonSize: 'small' as 'small',
    cropRadius: 75,
    minCropRadius: 40,
    lineWidth: 3,
    width: 300,
  };

  constructor(props: AvatarFieldProps) {
    super(props);
    this.state = {
      value: this.props.value,
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

  onImageLoad = (imageSrc: string) => {
    this.setState({loadedValue: imageSrc}, () => this.props.onImageLoad && this.props.onImageLoad(imageSrc));
  }

  onSave = (imageSrc: string) => {
    this.props.onValueChange(imageSrc);
    this.setState({value: imageSrc, loadedValue: undefined}, () => this.props.onSave && this.props.onSave(imageSrc));
  }

  onCancel = () => {
    this.setState({loadedValue: undefined}, () => this.props.onCancel && this.props.onCancel());
  }

  render() {
    if (this.props.visible === false) {
      return null;
    }

    const {classes, buttonSize, width, height, imageWidth, imageHeight, avatarDiameter, label, lineWidth, cropColor, backgroundColor, shadingColor, shadingOpacity, cropRadius, minCropRadius, onCrop, onLoad, onFileLoad, mimeTypes} = this.props;
    const bSize                              = buttonSize || this.defaultAvatarFieldProps.buttonSize;
    const {avatarContainer, ...otherClasses} = classes;
    let avatarCropperElement                 = undefined;

    if (this.state.loadedValue) {
      let containerWidth = width || this.defaultAvatarFieldProps.width;

      avatarCropperElement =
        <AvatarCropper
          classes={otherClasses}
          buttonSize={bSize}
          width={containerWidth}
          height={height || containerWidth}
          imageWidth={imageWidth}
          imageHeight={imageHeight}
          lineWidth={lineWidth || this.defaultAvatarFieldProps.lineWidth}
          cropColor={cropColor}
          backgroundColor={backgroundColor}
          shadingColor={shadingColor}
          shadingOpacity={shadingOpacity}
          cropRadius={cropRadius || this.defaultAvatarFieldProps.cropRadius}
          minCropRadius={minCropRadius || this.defaultAvatarFieldProps.minCropRadius}
          onCrop={onCrop}
          onLoad={onLoad}
          onSave={this.onSave}
          onCancel={this.onCancel}
          src={this.state.loadedValue}
        />;
    }

    return (
      <div className={classes.avatarContainer}>
        <InnerAvatar classes={otherClasses} buttonSize={bSize} avatarDiameter={avatarDiameter} mimeTypes={mimeTypes} label={label} onFileLoad={onFileLoad} onImageLoad={this.onImageLoad} value={this.state.value} />
        {avatarCropperElement}
      </div>
    );
  }
}

/*************** InnerAvatar ***************/

const innerAvatarStyles = () => ({
  loaderContainer: {
    border: '2px solid #979797',
    borderStyle: 'dashed',
    borderRadius: '8px',
    textAlign: 'center',
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
  label: {
    fontSize: '1.2em',
    fontWeight: '600',
    display: 'inline-block',
    cursor: 'pointer',
    width: '100%',
  },
});

export interface IInnerAvatarProps {
  classes?       : React.CSSProperties;
  buttonSize?    : 'small' | 'medium' | 'large';
  value?         : string;
  avatarDiameter?: number;
  mimeTypes?     : string;
  label?         : string;
  onFileLoad?    : (data: any) => void;
  onImageLoad    : (data: any) => void;
}

type InnerAvatarProps = WithStyle<ReturnType<typeof innerAvatarStyles>, IInnerAvatarProps>;

const InnerAvatar = withStyles(innerAvatarStyles, class extends React.Component<InnerAvatarProps> {
  private fileInputRef: React.RefObject<HTMLInputElement>;
  defaultInnerAvatarProps = {
    label: 'Upload Image',
    avatarDiameter: 150,
    buttonSize: 'small' as 'small',
    mimeTypes: 'image/jpeg,image/png',
  };

  constructor(props: InnerAvatarProps) {
    super(props);

    this.fileInputRef = React.createRef();
  }

  shouldComponentUpdate(nextProps: IInnerAvatarProps) {
    return nextProps.value !== this.props.value;
  }

  onFileLoad = (file: any) => {
    this.props.onFileLoad && this.props.onFileLoad(file);
  }

  handleFileLoad = (e: any) => {
    e.preventDefault();

    let reader = new FileReader();
    let file   = e.target && e.target.files[0];
    this.onFileLoad(file);

    let imageSrc: string;
    reader.onloadend = () => {
      imageSrc = reader.result as string;
      this.props.onImageLoad(imageSrc);
    };
    reader.readAsDataURL(file);
    let fileInput = this.fileInputRef.current;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  render() {
    const {classes, buttonSize, avatarDiameter, label, mimeTypes} = this.props;
    const bSize                = buttonSize || this.defaultInnerAvatarProps.buttonSize;
    const mTypes               = mimeTypes || this.defaultInnerAvatarProps.mimeTypes;
    const diameter             = (avatarDiameter || this.defaultInnerAvatarProps.avatarDiameter);
    const loaderLabel          = (label || this.defaultInnerAvatarProps.label);
    const diameterStr          = diameter + 'px';
    const labelStyle           = {lineHeight: diameterStr};
    const loaderContainerStyle = {
      width: diameterStr,
      height: diameterStr,
      borderRadius: diameterStr,
    };

    const fileInputId    = generateHash('changeImageButtonInnerInput');
    const fileInputProps = {
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => this.handleFileLoad(e),
      name: fileInputId,
      type: 'file',
      id: fileInputId,
      className: classes.changeImageButtonInnerInput,
      accept: mTypes,
      ref: this.fileInputRef,
    };

    return (
      this.props.value
        ? < >
            <MuiAvatar src={this.props.value} className={classes.muiAvatar} style={{width: diameterStr, height: diameterStr}} />
            <Button variant='contained' size={bSize} className={classNames(classes.button, classes.changeImageButton)}>
              <span>Change Image</span>
              <label className={classes.changeImageButtonInnerLabel} htmlFor={fileInputId} />
              <input {...fileInputProps} />
            </Button>
          </>
        : <div className={classes.loaderContainer} style={loaderContainerStyle}>
            <input {...fileInputProps} />
            <label htmlFor={fileInputId} className={classes.label} style={labelStyle}>{loaderLabel}</label>
          </div>
    );
  }
});

export default withStyles(avatarFieldStyles, AvatarField);
