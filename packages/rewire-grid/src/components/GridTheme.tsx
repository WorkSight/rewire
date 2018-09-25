import {createMuiTheme, Theme}       from '@material-ui/core/styles';
import {ThemeOptions}                from '@material-ui/core/styles/createMuiTheme';
import Color                         from 'color';
import merge                         from 'deepmerge';
import {IGridColors, IGridFontSizes} from '../models/GridTypes';

declare module '@material-ui/core/styles/createMuiTheme' {
  interface Theme {
    fontSizes: {
      header: string,
      body: string,
      groupRow: string,
    };
  }

  interface ThemeOptions {
    fontSizes?: {
      header?: string,
      body?: string,
      groupRow?: string,
    };
  }
}

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
    cellSelectedBackground: {
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
    rowStripedSelectedBackground: {
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
    cellSelectedBackground: {
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
    rowStripedSelectedBackground: {
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

const defaultGridColors: IGridColors = {
  headerBackground: '#607D8B',
  headerText: '#FFFFFF',
  headerBorder: Color('#607D8B').lighten(0.15).string(),
  gridBackground: '#FFFFFF',
  gridText: '#2e2e2e',
  gridBorder: '#e5e5e5',
  groupRowBackground: '#8AC0CE',
  rowSelectedBackground: '#D0DEE8',
  cellSelectedBackground: Color('#D0DEE8').lighten(0.07).string(),
  rowSelectedText: '#000000',
  rowStripedBackground: '#F5F8FA',
  rowStripedSelectedBackground: '#D0DEE8',
  leftLabelBackground: '#F5F8FA',
  cellOutline: '#1976D2',
};

const defaultGridFontSizes: IGridFontSizes = {
  header: '1rem',
  body: '1rem',
  groupRow: '0.9rem',
};

export default function createGridTheme(options: ThemeOptions = {}): Theme {
  let defaultPalette: any = {};
  Object.keys(defaultGridColors).forEach(colorName => {
    defaultPalette[colorName] = {main: defaultGridColors[colorName]};
  });

  let defaultThemeOptions: ThemeOptions = {palette: defaultPalette, fontSizes: defaultGridFontSizes};
  let gridThemeOptions: ThemeOptions    = merge(defaultThemeOptions, options);
  return createMuiTheme(gridThemeOptions);
}
