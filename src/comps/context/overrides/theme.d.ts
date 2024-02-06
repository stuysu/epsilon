import { 
    Palette, 
    PaletteOptions
} from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface TransparencyOptions {
    background: string;
    border: string;
    borderDarker: string;
    text: string;
    textLighter: string;
  }

  interface Palette {
    button: {
        main: string;
    }
    transparency: TransparencyOptions
  }
  // allow configuration using `createTheme`
  interface PaletteOptions {
    button?: {
        main?: string;
    }
    transparency?: TransparencyOptions
  }
}