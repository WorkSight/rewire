import React                                             from 'react';
import classNames                                        from 'classnames';
import { isNullOrUndefined }                             from 'rewire-common';
import {default as MuiAvatar}                            from '@material-ui/core/Avatar';
import Button                                            from '@material-ui/core/Button';
import {withStyles, WithStyle}                           from './styles';
import AvatarCropper, {AvatarCropperProps, generateHash} from './AvatarCropper';

/*************** AvatarField ***************/

const avatarFieldStyles = () => ({
  avatarContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
});

export type AvatarFieldStyles = ReturnType<typeof avatarFieldStyles>;

export interface IAvatarFieldProps {
  className?      : string;
  visible?        : boolean;
  classes?        : React.CSSProperties;
  disabled?       : boolean;
  value?          : string;
  tooltip?        : string | ((value: any) => string);
  avatarDiameter? : number;
  avatarChildren? : any;
  avatarClasses?  : object;
  mimeTypes?      : string;
  label?          : string;

  onFileLoad?(data: any): void;
  onImageLoad?(data: any): void;
  onValueChange(v?: string): void;
}

export type AvatarFieldProps = WithStyle<AvatarFieldStyles, IAvatarFieldProps & AvatarCropperProps>;

interface IAvatarFieldState {
  value?: string;
  loadedValue?: string;
}

class AvatarField extends React.Component<AvatarFieldProps, IAvatarFieldState> {
  state: IAvatarFieldState;
  defaultAvatarFieldProps = {
    buttonSize: 'small' as const,
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
      (nextProps.value          !== this.props.value)          ||
      (nextProps.visible        !== this.props.visible)        ||
      (nextProps.label          !== this.props.label)          ||
      (nextProps.mimeTypes      !== this.props.mimeTypes)      ||
      (nextProps.avatarDiameter !== this.props.avatarDiameter) ||
      (nextProps.avatarChildren !== this.props.avatarChildren) ||
      (nextProps.avatarClasses  !== this.props.avatarClasses)  ||
      (nextProps.tooltip        !== this.props.tooltip)        ||
      (nextProps.disabled       !== this.props.disabled)       ||
      (nextState.value          !== this.state.value)          ||
      (nextState.loadedValue    !== this.state.loadedValue)
    );
  }

  getTooltip(value: any): string | undefined {
    let tooltip = this.props.tooltip;
    if (isNullOrUndefined(tooltip)) {
      return undefined;
    }
    if (is.function(tooltip))  {
      tooltip = (tooltip as CallableFunction)(value);
    }
    return tooltip as string;
  }

  onImageLoad = (imageSrc: string) => {
    this.setState({loadedValue: imageSrc}, () => this.props.onImageLoad && this.props.onImageLoad(imageSrc));
  };

  onSave = (imageSrc?: string) => {
    this.props.onValueChange(imageSrc);
    this.setState({value: imageSrc, loadedValue: undefined}, () => this.props.onSave && this.props.onSave(imageSrc));
  };

  onCancel = () => {
    this.setState({loadedValue: undefined}, () => this.props.onCancel && this.props.onCancel());
  };

  render() {
    if (this.props.visible === false) {
      return null;
    }

    const {classes, buttonSize, width, height, imageWidth, imageHeight, avatarDiameter, avatarChildren, avatarClasses, label, disabled, lineWidth, cropColor, backgroundColor, shadingColor, shadingOpacity, cropRadius, minCropRadius, onCrop, onLoad, onFileLoad, mimeTypes} = this.props;
    const bSize                              = buttonSize || this.defaultAvatarFieldProps.buttonSize;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {avatarContainer, ...otherClasses} = classes;
    let avatarCropperElement                 = undefined;

    if (this.state.loadedValue) {
      const containerWidth = width || this.defaultAvatarFieldProps.width;

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
      <div className={classNames(this.props.className, classes.avatarContainer)}>
        <InnerAvatar classes={otherClasses} tooltip={this.getTooltip(this.state.value)} buttonSize={bSize} avatarDiameter={avatarDiameter} avatarChildren={avatarChildren} avatarClasses={avatarClasses} mimeTypes={mimeTypes} label={label} onFileLoad={onFileLoad} onImageLoad={this.onImageLoad} onSave={this.onSave} disabled={disabled} value={this.state.value} />
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
    margin: '0px',
    position: 'relative',
  },
  deleteImageButton: {
    margin: '0px',
    position: 'relative',
  },
  muiAvatar: {
    marginBottom: '15px',
  },
  buttonsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
  },
  button: {
    minWidth: '70px',
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
    fontSize: '1.1em',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    width: '100%',
  },
  disabled: {
    opacity: '0.38',
    cursor: 'default',
  },
});

export type InnerAvatarStyles = ReturnType<typeof innerAvatarStyles>;

interface IInnerAvatarProps {
  classes?       : React.CSSProperties;
  buttonSize?    : 'small' | 'medium' | 'large';
  disabled?      : boolean;
  value?         : string;
  tooltip?       : string;
  avatarDiameter?: number;
  avatarChildren?: any;
  avatarClasses? : object;
  mimeTypes?     : string;
  label?         : string;

  onFileLoad?(data: any): void;
  onImageLoad(data: any): void;
  onSave(v?: string): void;
}

export type InnerAvatarProps = WithStyle<InnerAvatarStyles, IInnerAvatarProps>;

const InnerAvatar = withStyles(innerAvatarStyles, class extends React.Component<InnerAvatarProps> {
  private fileInputRef: React.RefObject<HTMLInputElement>;
  defaultInnerAvatarProps = {
    label: 'Upload Image',
    avatarDiameter: 150,
    buttonSize: 'small' as const,
    mimeTypes: 'image/jpeg,image/png',
  };

  constructor(props: InnerAvatarProps) {
    super(props);

    this.fileInputRef = React.createRef();
  }

  shouldComponentUpdate(nextProps: IInnerAvatarProps) {
    return (
      (nextProps.value          !== this.props.value)          ||
      (nextProps.label          !== this.props.label)          ||
      (nextProps.mimeTypes      !== this.props.mimeTypes)      ||
      (nextProps.avatarDiameter !== this.props.avatarDiameter) ||
      (nextProps.avatarChildren !== this.props.avatarChildren) ||
      (nextProps.avatarClasses  !== this.props.avatarClasses)  ||
      (nextProps.tooltip        !== this.props.tooltip)        ||
      (nextProps.disabled       !== this.props.disabled)
    );
  }

  onFileLoad = (file: any) => {
    this.props.onFileLoad && this.props.onFileLoad(file);
  };

  handleFileLoad = (e: any) => {
    e.preventDefault();

    const reader = new FileReader();
    const file   = e.target && e.target.files[0];
    this.onFileLoad(file);

    let imageSrc: string;
    reader.onloadend = () => {
      imageSrc = reader.result as string;
      this.props.onImageLoad(imageSrc);
    };
    reader.readAsDataURL(file);
    const fileInput = this.fileInputRef.current;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  deleteImage = (_e: React.MouseEvent<any>) => {
    this.props.onSave();
  };

  render() {
    const {classes, buttonSize, avatarDiameter, avatarChildren, avatarClasses, label, disabled, mimeTypes} = this.props;
    const bSize                = buttonSize || this.defaultInnerAvatarProps.buttonSize;
    const mTypes               = mimeTypes || this.defaultInnerAvatarProps.mimeTypes;
    const diameter             = (avatarDiameter || this.defaultInnerAvatarProps.avatarDiameter);
    const loaderLabel          = (label || this.defaultInnerAvatarProps.label);
    const diameterStr          = diameter + 'px';
    const labelStyle           = {height: diameterStr};
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
      tabIndex: -1,
      className: classes.changeImageButtonInnerInput,
      accept: mTypes,
      ref: this.fileInputRef,
      disabled: disabled,
    };

    return (
      this.props.value || !isNullOrUndefined(avatarChildren)
        ? < >
            <MuiAvatar title={this.props.tooltip} src={this.props.value} className={classes.muiAvatar} classes={avatarClasses} style={{width: diameterStr, height: diameterStr}}>{avatarChildren}</MuiAvatar>
            {!disabled &&
              <div className={classes.buttonsContainer}>
                <Button variant='contained' component='label' size={bSize} tabIndex={-1} disabled={disabled} className={classNames(classes.button, classes.changeImageButton)}>
                  <span>Change</span>
                  <label className={classes.changeImageButtonInnerLabel} htmlFor={fileInputId} />
                  <input {...fileInputProps} />
                </Button>
                {this.props.value
                  ? <Button variant='contained' component='label' size={bSize} tabIndex={-1} disabled={disabled} className={classNames(classes.button, classes.deleteImageButton)} onClick={this.deleteImage}>
                      <span>Delete</span>
                    </Button>
                  : null
                }
              </div>
            }
          </>
        : <div className={classes.loaderContainer} style={loaderContainerStyle}>
            <input {...fileInputProps} />
            <label htmlFor={fileInputId} className={classNames(classes.label, disabled ? classes.disabled : undefined)} style={labelStyle}>{loaderLabel}</label>
          </div>
    );
  }
});

export default withStyles(avatarFieldStyles, AvatarField);
