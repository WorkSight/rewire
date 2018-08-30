
import * as React from 'react';
import Konva from 'konva/src/Core';
import 'konva/src/shapes/Image';
import 'konva/src/shapes/Circle';
import 'konva/src/shapes/Rect';
import 'konva/src/shapes/Path';
import 'konva/src/Animation';
import 'konva/src/DragAndDrop';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import {withStyles, WithStyle} from './styles';

const styles = () => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  loaderContainer: {
    border: '2px solid #979797',
    borderStyle: 'dashed',
    borderRadius: '8px',
    textAlign: 'center',
  },
  cropperDialogPaper: {
    border: '15px solid #fff',
    borderBottomWidth: '5px',
    maxWidth: 'calc(100% - 30px)',
    maxHeight: 'calc(100% - 30px)',
    overflow: 'hidden',
  },
  cropperOuterContainer: {
    overflow: 'auto',
  },
  cropperContainer: {
    display: 'flex',
    flex: '0 0 auto',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderRadius: '4px',
    minWidth: '200px',
    minHeight: '200px',
  },
  buttonsContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: '0 0 auto',
    marginTop: '15px',
    marginBottom: '10px',
    '& > button:first-child': {
      marginRight: '20px',
    },
  },
  button: {

  },
  input: {
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

export interface IAvatarCropperProps {
  classes?: React.CSSProperties;
  buttonSize?: 'small' | 'medium' | 'large';
  avatarDiameter?: number;
  img?: HTMLImageElement;
  src?: string;
  width: number;
  height: number;
  imageWidth: number;
  imageHeight: number;
  cropRadius?: number;
  cropColor?: string;
  lineWidth?: number;
  minCropRadius?: number;
  backgroundColor?: string;
  shadingColor?: string;
  shadingOpacity?: number;
  mimeTypes?: string;
  label?: string;
  mobileScaleSpeed?: number;
  onImageLoad?: (data: HTMLImageElement) => void;
  onCrop?: (data: string) => void;
  onFileLoad?: (data: any) => void;
  onSave?: (data: string) => void;
  onCancel?: () => void;
}

interface IAvatarCropperState {
  imgWidth: number;
  imgHeight: number;
  scale: number;
  containerId: string;
  loaderId: string;
  lastMouseY: number;
  showLoader: boolean;
  image?: HTMLImageElement;
  crop: Konva.Circle;
  cropRadius: number;
}

type AvatarCropperProps = WithStyle<ReturnType<typeof styles>, IAvatarCropperProps>;

class AvatarCropper extends React.Component<AvatarCropperProps, IAvatarCropperState> {
  state: IAvatarCropperState;

  static defaultProps = {
    avatarDiameter: 150,
    buttonSize: 'small',
    shadingColor: 'grey',
    shadingOpacity: 0.6,
    cropRadius: 100,
    cropColor: 'white',
    lineWidth: 4,
    minCropRadius: 20,
    backgroundColor: '#444',
    mimeTypes: 'image/jpeg,image/png',
    mobileScaleSpeed: 0.5, // experimental
    onCancel: () => {
    },
    onSave: () => {
    },
    onCrop: () => {
    },
    onFileLoad: () => {
    },
    onImageLoad: () => {
    },
    label: 'Choose a file',
  };

  constructor(props: AvatarCropperProps) {
    super(props);
    const containerId = generateHash('avatar_container');
    const loaderId    = generateHash('avatar_loader');
    this.state = {
      imgWidth: 0,
      imgHeight: 0,
      scale: 1,
      containerId,
      loaderId,
      lastMouseY: 0,
      showLoader: !(this.props.src || this.props.img),
      crop: undefined,
      cropRadius: 0,
      image: undefined,
    };
  }

  get lineWidth(): number | undefined {
    return this.props.lineWidth;
  }

  get containerId(): string {
    return this.state.containerId;
  }

  get cropColor(): string | undefined {
    return this.props.cropColor;
  }

  get loaderId(): string {
    return this.state.loaderId;
  }

  get mimeTypes(): string | undefined {
    return this.props.mimeTypes;
  }

  get backgroundColor(): string | undefined {
    return this.props.backgroundColor;
  }

  get shadingColor(): string | undefined {
    return this.props.shadingColor;
  }

  get shadingOpacity(): number | undefined {
    return this.props.shadingOpacity;
  }

  get mobileScaleSpeed(): number | undefined {
    return this.props.mobileScaleSpeed;
  }

  get cropRadius(): number {
    return this.state.cropRadius;
  }

  get minCropRadius(): number | undefined {
    return this.props.minCropRadius;
  }

  get scale(): number {
    return this.state.scale;
  }

  get width(): number {
    return this.state.imgWidth;
  }

  get halfWidth(): number {
    return this.state.imgWidth / 2;
  }

  get height(): number {
    return this.state.imgHeight;
  }

  get halfHeight(): number {
    return this.state.imgHeight / 2;
  }

  get image(): HTMLImageElement | undefined {
    return this.state.image;
  }

  onCancelCallback() {
    this.props.onCancel && this.props.onCancel();
  }

  onSaveCallback(img: string) {
    this.props.onSave && this.props.onSave(img);
  }

  onCropCallback(img: string) {
    this.props.onCrop && this.props.onCrop(img);
  }

  onFileLoadCallback(file: any) {
    this.props.onFileLoad && this.props.onFileLoad(file);
  }

  onImageLoadCallback(image: HTMLImageElement) {
    this.props.onImageLoad && this.props.onImageLoad(image);
  }

  componentDidMount() {
    if (this.state.showLoader) return;

    const image = this.props.img || new Image();
    if (!this.props.img && this.props.src) image.src = this.props.src;
    this.setState({ image }, () => {
      if (this.image) {
        if (this.image.complete) {
          return this.init();
        }
        this.image.onload = () => {
          this.onImageLoadCallback(this.image!);
          this.init();
        };
      }
    });
  }

  onFileLoad = (e: any) => {
    e.preventDefault();

    let reader = new FileReader();
    let file   = e.target.files[0];
    this.onFileLoadCallback(file);

    const image = new Image();
    const ref   = this;
    reader.onloadend = () => {
      image.src = reader.result as string;

      ref.setState({ image, showLoader: false }, () => {
        if (ref.image) {
          if (ref.image.complete) {
            return ref.init();
          }
          ref.image.onload = () => ref.init();
        }
      });
    };
    reader.readAsDataURL(file);
  }

  onCancelClick = () => {
    this.setState({ showLoader: true }, () => this.onCancelCallback());
  }

  onSaveClick = () => {
    this.setState({ showLoader: true }, () => this.onSaveCallback(this.getPreview()));
  }

  getPreview() {
    const crop = this.state.crop;

    return (
      crop.toDataURL({
        x: crop.x() - crop.radius(),
        y: crop.y() - crop.radius(),
        width: crop.radius() * 2,
        height: crop.radius() * 2
      })
    );
  }

  init() {
    const originalWidth  = this.image && this.image.width || 0;
    const originalHeight = this.image && this.image.height || 0;
    const imgRatio       = originalHeight ? originalHeight / originalWidth : 0;
    const { imageWidth, imageHeight } = this.props;
    let imgHeight;
    let imgWidth;

    if (imageHeight && imageWidth) {
      console.warn('The imageWidth and imageHeight properties can not be set together, using only imageWidth.');
    }

    if (imageHeight && !imageWidth) {
      imgHeight = imageHeight;
      imgWidth  = imgHeight / imgRatio;
    } else if (imageWidth) {
      imgWidth  = imageWidth;
      imgHeight = imgWidth * imgRatio;
    } else {
      if (imgRatio > 1) {
        imgHeight = Math.min(this.height, originalHeight);
        imgWidth  = imgHeight / imgRatio;
      } else {
        imgWidth  = Math.min(this.width, originalWidth);
        imgHeight = imgWidth * imgRatio;
      }
    }

    const scale = imgHeight / originalHeight;

    let cRadius      = this.props.cropRadius ? Math.min(Math.abs(this.props.cropRadius), Math.min((imgWidth / 2), (imgHeight / 2))) : 0;
    const cropRadius = cRadius || (imgWidth / 4);

    this.setState({
      imgWidth,
      imgHeight,
      scale,
      cropRadius
    }, this.initCrop);
  }

  initCrop() {
    let crop = new Konva.Circle({
      x: this.halfWidth,
      y: this.halfHeight,
      radius: this.cropRadius,
      fillPatternImage: this.image,
      fillPatternOffset: {
        x: this.halfWidth / this.scale,
        y: this.halfHeight / this.scale
      },
      fillPatternScale: {
        x: this.scale,
        y: this.scale
      },
      opacity: 1,
      draggable: true,
      dashEnabled: true,
      dash: [10, 5]
    });

    this.setState({crop: crop}, this.initCanvas);
  }

  initCanvas() {
    const stage      = this.initStage();
    const background = this.initBackground();
    const shading    = this.initShading();
    const cropStroke = this.initCropStroke();
    const resize     = this.initResize();
    const resizeIcon = this.initResizeIcon();
    const layer      = new Konva.Layer();
    const crop       = this.state.crop;

    layer.add(background);
    layer.add(shading);
    layer.add(cropStroke);
    layer.add(crop);

    layer.add(resize);
    layer.add(resizeIcon);

    stage.add(layer);

    const scaledRadius    = (scale: number = 0) => crop.radius() - scale;
    const isLeftCorner    = (scale?: number) => crop.x() - scaledRadius(scale) < 0;
    const calcLeft        = () => crop.radius() + 1;
    const isTopCorner     = (scale?: number) => crop.y() - scaledRadius(scale) < 0;
    const calcTop         = () => crop.radius() + 1;
    const isRightCorner   = (scale?: number) => crop.x() + scaledRadius(scale) > stage.width();
    const calcRight       = () => stage.width() - crop.radius() - 1;
    const isBottomCorner  = (scale?: number) => crop.y() + scaledRadius(scale) > stage.height();
    const calcBottom      = () => stage.height() - crop.radius() - 1;
    const isNotOutOfScale = (scale?: number) => !isLeftCorner(scale) && !isRightCorner(scale) && !isBottomCorner(scale) && !isTopCorner(scale);
    const calcScaleRadius = (scale: number) => scaledRadius(scale) >= (this.minCropRadius || 0) ? scale : crop.radius() - Math.min((this.minCropRadius || 0), (Math.min(this.state.imgWidth, this.state.imgHeight) / 2));
    const calcResizerX    = (x: number) => x + (crop.radius() * 0.86);
    const calcResizerY    = (y: number) => y - (crop.radius() * 0.5);
    const moveResizer     = (x: number, y: number) => {
      resize.x(calcResizerX(x) - 8);
      resize.y(calcResizerY(y) - 8);
      resizeIcon.x(calcResizerX(x) - 8);
      resizeIcon.y(calcResizerY(y) - 10);
    };

    const onScaleCallback = (scaleY: number) => {
      const scale = scaleY > 0 || isNotOutOfScale(scaleY) ? scaleY : 0;
      cropStroke.radius(cropStroke.radius() - calcScaleRadius(scale));
      crop.radius(crop.radius() - calcScaleRadius(scale));
      resize.fire('resize');
    };

    this.onCropCallback(this.getPreview());

    crop.on('dragmove', () => crop.fire('resize'));
    crop.on('dragend', () => this.onCropCallback(this.getPreview()));

    crop.on('resize', () => {
      const x = isLeftCorner() ? calcLeft() : (isRightCorner() ? calcRight() : crop.x());
      const y = isTopCorner() ? calcTop() : (isBottomCorner() ? calcBottom() : crop.y());
      moveResizer(x, y);
      crop.setFillPatternOffset({ x: x / this.scale, y: y / this.scale });
      crop.x(x);
      cropStroke.x(x);
      crop.y(y);
      cropStroke.y(y);
    });

    crop.on('mouseenter', () => stage.container().style.cursor = 'move');
    crop.on('mouseleave', () => stage.container().style.cursor = 'default');
    crop.on('dragstart', () => stage.container().style.cursor = 'move');
    crop.on('dragend', () => stage.container().style.cursor = 'default');

    resize.on('touchstart', (evt: any) => {
      resize.on('dragmove', (dragEvt: any) => {
        if (dragEvt.evt.type !== 'touchmove') return;
        const scaleY = (dragEvt.evt.changedTouches['0'].pageY - evt.evt.changedTouches['0'].pageY) || 0;
        onScaleCallback(scaleY * (this.mobileScaleSpeed || 0));
      });
    });

    resize.on('dragmove', (evt: any) => {
      if (evt.evt.type === 'touchmove') return;
      const newMouseY     = evt.evt.y;
      const ieScaleFactor = newMouseY ? (newMouseY - this.state.lastMouseY) : undefined;
      const scaleY        = evt.evt.movementY || ieScaleFactor || 0;
      this.setState({
        lastMouseY: newMouseY,
      });
      onScaleCallback(scaleY);
    });
    resize.on('dragend', () => this.onCropCallback(this.getPreview()));

    resize.on('resize', () => moveResizer(crop.x(), crop.y()));

    resize.on('mouseenter', () => stage.container().style.cursor = 'nesw-resize');
    resize.on('mouseleave', () => stage.container().style.cursor = 'default');
    resize.on('dragstart', (evt: any) => {
      this.setState({
        lastMouseY: evt.evt.y,
      });
      stage.container().style.cursor = 'nesw-resize';
    });
    resize.on('dragend', () => stage.container().style.cursor = 'default');
  }

  initStage(): Konva.Stage {
    return new Konva.Stage({
      container: this.containerId,
      width: this.width,
      height: this.height
    });
  }

  initBackground(): Konva.Image {
    return new Konva.Image({
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
      image: this.image
    });
  }

  initShading(): Konva.Rect {
    return new Konva.Rect({
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
      fill: this.shadingColor,
      strokeWidth: 4,
      opacity: this.shadingOpacity
    });
  }

  initCropStroke(): Konva.Circle {
    return new Konva.Circle({
      x: this.halfWidth,
      y: this.halfHeight,
      radius: this.cropRadius,
      stroke: this.cropColor,
      strokeWidth: this.lineWidth,
      strokeScaleEnabled: true,
      dashEnabled: true,
      dash: [10, 5]
    });
  }

  initResize(): Konva.Rect {
    return new Konva.Rect({
      x: this.halfWidth + this.cropRadius * 0.86 - 8,
      y: this.halfHeight + this.cropRadius * -0.5 - 8,
      width: 16,
      height: 16,
      draggable: true,
      dragBoundFunc: function (pos: any) {
        return {
          x: this.getAbsolutePosition().x,
          y: pos.y
        };
      }
    });
  }

  initResizeIcon(): Konva.Path {
    return new Konva.Path({
      x: this.halfWidth + this.cropRadius * 0.86 - 8,
      y: this.halfHeight + this.cropRadius * -0.5 - 10,
      data: 'M47.624,0.124l12.021,9.73L44.5,24.5l10,10l14.661-15.161l9.963,12.285v-31.5H47.624z M24.5,44.5   L9.847,59.653L0,47.5V79h31.5l-12.153-9.847L34.5,54.5L24.5,44.5z',
      fill: this.cropColor,
      scale: {
        x: 0.2,
        y: 0.2
      }
    });
  }

  render() {
    const {classes, buttonSize, label, avatarDiameter, width, height} = this.props;
    const labelStyle               = {lineHeight: (avatarDiameter || 200) + 'px'};
    const loaderContainerDimension = (avatarDiameter || 200) + 'px';
    const loaderContainerStyle     = {
      width: loaderContainerDimension,
      height: loaderContainerDimension,
      borderRadius: loaderContainerDimension,
    };

    let cropperContainerWidth;
    let cropperContainerHeight;
    let ratio = this.state.imgHeight / this.state.imgWidth;
    if (ratio > 1) {
      cropperContainerHeight = Math.min(height, this.state.imgHeight);
      cropperContainerWidth  = Math.min(width, this.state.imgWidth);
    } else {
      cropperContainerWidth  = Math.min(width, this.state.imgWidth);
      cropperContainerHeight = Math.min(height, this.state.imgHeight);
    }

    const cropperContainerStyle = {
      width: cropperContainerWidth + 40,
      height: cropperContainerHeight + 40,
      backgroundColor: this.backgroundColor,
    };

    return (
      <div className={classes.root}>
        {
          this.state.showLoader
            ? <div className={classes.loaderContainer} style={loaderContainerStyle}>
                <input
                  onChange={(e) => this.onFileLoad(e)}
                  name={this.loaderId} type='file'
                  id={this.loaderId}
                  className={classes.input}
                  accept={this.mimeTypes}
                />
                <label htmlFor={this.loaderId} className={classes.label} style={labelStyle}>{label}</label>
              </div>
            : <Dialog classes={{paper: classes.cropperDialogPaper}} open={true} disableBackdropClick={true} onEscapeKeyDown={this.onCancelClick}>
                <div className={classes.cropperOuterContainer}>
                  <div className={classes.cropperContainer} style={cropperContainerStyle}>
                    <div id={this.containerId} />
                  </div>
                </div>
                <div className={classes.buttonsContainer}>
                  <Button className={classes.button} variant='contained' size={buttonSize} onClick={this.onCancelClick}>Cancel</Button>
                  <Button className={classes.button} variant='contained' size={buttonSize} onClick={this.onSaveClick}>Crop</Button>
                </div>
              </Dialog>
        }
      </div>
    );
  }
}

export function generateHash(prefix: string): string {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return prefix + '-' + s4() + '-' + s4() + '-' + s4();
}

export default withStyles(styles, AvatarCropper);
