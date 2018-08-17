import {createMuiTheme, Theme}              from '@material-ui/core/styles';
import {ThemeOptions}                       from '@material-ui/core/styles/createMuiTheme';
import Color                                from 'color';
import * as merge                           from 'deepmerge';
import {IGridColors, IGridCalculatedColors} from '../models/GridTypes';

declare module '@material-ui/core/styles/createPalette' {
  interface Palette {
    headerBackground: {
      light: string,
      main: string,
      dark: string,
    };
    headerText: {
      light: string,
      main: string,
      dark: string,
    };
    headerBorder: {
      light: string,
      main: string,
      dark: string,
    };
    gridBackground: {
      light: string,
      main: string,
      dark: string,
    };
    gridText: {
      light: string,
      main: string,
      dark: string,
    };
    gridBorder: {
      light: string,
      main: string,
      dark: string,
    };
    groupRowBackground: {
      light: string,
      main: string,
      dark: string,
    };
    rowSelectedBackground: {
      light: string,
      main: string,
      dark: string,
    };
    rowSelectedText: {
      light: string,
      main: string,
      dark: string,
    };
    rowStripedBackground: {
      light: string,
      main: string,
      dark: string,
    };
    rowStripedBackgroundSelected: {
      light: string,
      main: string,
      dark: string,
    };
    leftLabelBackground: {
      light: string,
      main: string,
      dark: string,
    };
    cellOutline: {
      light: string,
      main: string,
      dark: string,
    };
  }
  interface PaletteOptions {
    headerBackground: {
      light?: string,
      main?: string,
      dark?: string,
    };
    headerText: {
      light?: string,
      main?: string,
      dark?: string,
    };
    headerBorder: {
      light?: string,
      main?: string,
      dark?: string,
    };
    gridBackground: {
      light?: string,
      main?: string,
      dark?: string,
    };
    gridText: {
      light?: string,
      main?: string,
      dark?: string,
    };
    gridBorder: {
      light?: string,
      main?: string,
      dark?: string,
    };
    groupRowBackground: {
      light?: string,
      main?: string,
      dark?: string,
    };
    rowSelectedBackground: {
      light?: string,
      main?: string,
      dark?: string,
    };
    rowSelectedText: {
      light?: string,
      main?: string,
      dark?: string,
    };
    rowStripedBackground: {
      light?: string,
      main?: string,
      dark?: string,
    };
    rowStripedBackgroundSelected: {
      light?: string,
      main?: string,
      dark?: string,
    };
    leftLabelBackground: {
      light?: string,
      main?: string,
      dark?: string,
    };
    cellOutline: {
      light?: string,
      main?: string,
      dark?: string,
    };
  }
}

const defaultGridColors: IGridColors & IGridCalculatedColors = {
  headerBackground: '#607D8B',
  headerText: '#FFFFFF',
  headerBorder: Color('#607D8B').lighten(0.15).string(),
  gridBackground: '#FFFFFF',
  gridText: '#2e2e2e',
  gridBorder: '#e5e5e5',
  groupRowBackground: '#8AC0CE',
  rowSelectedBackground: '#C2D4E1',
  rowSelectedText: '#000000',
  rowStripedBackground: '#F5F8FA',
  rowStripedBackgroundSelected: Color('#F5F8FA').darken(0.15).string(),
  leftLabelBackground: '#F5F8FA',
  cellOutline: '#1976D2',
};

export default function createGridTheme(options: ThemeOptions): Theme {
  let defaultPalette: any = {};
  Object.keys(defaultGridColors).forEach(colorName => {
    defaultPalette[colorName] = {main: defaultGridColors[colorName]};
  });
  let defaultTheme: ThemeOptions = {palette: defaultPalette};
  let gridTheme: ThemeOptions    = merge(defaultTheme, options);
  return createMuiTheme(gridTheme);
}
