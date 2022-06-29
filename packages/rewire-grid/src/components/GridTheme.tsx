import {createTheme, Theme}       from '@material-ui/core/styles';
import {ThemeOptions}                from '@material-ui/core/styles';
import Color                    from 'color';
import merge                    from 'deepmerge';
import {IGridColors, IGridFontSizes} from '../models/GridTypes';

declare module '@material-ui/core/styles' {
  interface Theme {
    fontSizes: {
      header: string,
      body: string,
      groupRow: string,
      toggleMenu: string,
    };
  }

  interface ThemeOptions {
    fontSizes?: {
      header?: string,
      body?: string,
      groupRow?: string,
      toggleMenu?: string,
    };
  }
}

declare module '@material-ui/core/styles/createPalette' {
  interface Palette {
    headerBackground: {
      light: string,
      main: string,
      dark: string,
      contrastText: string,
    };
    headerText: {
      light: string,
      main: string,
      dark: string,
      contrastText: string,
    };
    headerBorder: {
      light: string,
      main: string,
      dark: string,
      contrastText: string,
    };
    gridBackground: {
      light: string,
      main: string,
      dark: string,
      contrastText: string,
    };
    gridText: {
      light: string,
      main: string,
      dark: string,
      contrastText: string,
    };
    gridSettingsIcon: {
      light: string,
      main: string,
      dark: string,
      contrastText: string,
    };
    gridBorder: {
      light: string,
      main: string,
      dark: string,
      contrastText: string,
    };
    gridBorderSelected: {
      light: string,
      main: string,
      dark: string,
      contrastText: string,
    };
    groupRowBackground: {
      light: string,
      main: string,
      dark: string,
      contrastText: string,
    };
    rowSelectedBackground: {
      light: string,
      main: string,
      dark: string,
      contrastText: string,
    };
    rowSelectedBorder: {
      light: string,
      main: string,
      dark: string,
      contrastText: string,
    };
    cellSelectedBackground: {
      light: string,
      main: string,
      dark: string,
      contrastText: string,
    };
    rowSelectedText: {
      light: string,
      main: string,
      dark: string,
      contrastText: string,
    };
    rowStripedBackground: {
      light: string,
      main: string,
      dark: string,
      contrastText: string,
    };
    rowStripedSelectedBackground: {
      light: string,
      main: string,
      dark: string,
      contrastText: string,
    };
    leftLabelBackground: {
      light: string,
      main: string,
      dark: string,
      contrastText: string,
    };
    cellOutline: {
      light: string,
      main: string,
      dark: string,
      contrastText: string,
    };
  }
  interface PaletteOptions {
    headerBackground: {
      light?: string,
      main?: string,
      dark?: string,
      contrastText?: string,
    };
    headerText: {
      light?: string,
      main?: string,
      dark?: string,
      contrastText?: string,
    };
    headerBorder: {
      light?: string,
      main?: string,
      dark?: string,
      contrastText?: string,
    };
    gridBackground: {
      light?: string,
      main?: string,
      dark?: string,
      contrastText?: string,
    };
    gridText: {
      light?: string,
      main?: string,
      dark?: string,
      contrastText?: string,
    };
    gridSettingsIcon: {
      light?: string,
      main?: string,
      dark?: string,
      contrastText?: string,
    };
    gridBorder: {
      light?: string,
      main?: string,
      dark?: string,
      contrastText?: string,
    };
    gridBorderSelected: {
      light?: string,
      main?: string,
      dark?: string,
      contrastText?: string,
    };
    groupRowBackground: {
      light?: string,
      main?: string,
      dark?: string,
      contrastText?: string,
    };
    rowSelectedBackground: {
      light?: string,
      main?: string,
      dark?: string,
      contrastText?: string,
    };
    rowSelectedBorder: {
      light?: string,
      main?: string,
      dark?: string,
      contrastText?: string,
    };
    cellSelectedBackground: {
      light?: string,
      main?: string,
      dark?: string,
      contrastText?: string,
    };
    rowSelectedText: {
      light?: string,
      main?: string,
      dark?: string,
      contrastText?: string,
    };
    rowStripedBackground: {
      light?: string,
      main?: string,
      dark?: string,
      contrastText?: string,
    };
    rowStripedSelectedBackground: {
      light?: string,
      main?: string,
      dark?: string,
      contrastText?: string,
    };
    leftLabelBackground: {
      light?: string,
      main?: string,
      dark?: string,
      contrastText?: string,
    };
    cellOutline: {
      light?: string,
      main?: string,
      dark?: string,
      contrastText?: string,
    };
  }
}

const defaultGridColors: IGridColors = {
  headerBackground: '#607D8B',
  headerText: '#FFFFFF',
  gridBackground: '#FFFFFF',
  gridText: '#2e2e2e',
  gridSettingsIcon: '#fff',
  gridBorder: '#e5e5e5',
  groupRowBackground: '#8AC0CE',
  rowSelectedBackground: '#D0DEE8',
  rowSelectedText: '#000000',
  rowStripedBackground: '#F5F8FA',
  rowStripedSelectedBackground: '#D0DEE8',
  leftLabelBackground: '#FFFFFF',
  cellOutline: '#1976D2',
};

defaultGridColors.headerBorder           = Color(defaultGridColors.headerBackground).lighten(0.15).string();
defaultGridColors.cellSelectedBackground = Color(defaultGridColors.rowSelectedBackground).lighten(0.07).string();
defaultGridColors.gridBorderSelected     = Color(defaultGridColors.cellSelectedBackground).darken(0.12).string();
defaultGridColors.rowSelectedBorder      = Color(defaultGridColors.rowSelectedBackground).darken(0.12).string();

const defaultGridFontSizes: IGridFontSizes = {
  header: '1rem',
  body: '1rem',
  groupRow: '1rem',
  toggleMenu: '1rem',
};

const defaultGridTypography: any = {
};

export default function createGridTheme(options: ThemeOptions = {}, outerTheme?: Theme): Theme {
  let fontSizes    = defaultGridFontSizes;
  let typography   = defaultGridTypography;
  let palette: any = {};
  Object.keys(defaultGridColors).forEach(colorName => {
    palette[colorName] = {main: defaultGridColors[colorName]};
  });

  if (outerTheme) {
    palette    = merge(outerTheme.palette, palette);
    fontSizes  = merge(outerTheme.fontSizes, fontSizes);
    typography = merge(outerTheme.typography, typography);
  }

  const defaultThemeOptions: ThemeOptions = {...outerTheme, palette: palette, fontSizes: fontSizes, typography: typography};
  const gridThemeOptions: ThemeOptions    = merge(defaultThemeOptions, options);
  const gridTheme = createTheme(gridThemeOptions);

  return gridTheme;
}
