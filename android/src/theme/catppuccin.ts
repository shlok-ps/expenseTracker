// theme/catppuccin.js

export interface ITheme {
  background: string,
  surface: string,
  text: string,
  subtle: string,
  primary: string,
  red: string,
  green: string,
  yellow: string,
  blue: string,
  accent: string,
  mantle: string,
  crust: string;
}
export const catppuccin: { [key: string]: ITheme } = {
  latte: {
    background: '#fefcf9',
    surface: '#f5f3f0',
    text: '#4c4f69',
    subtle: '#6c6f85',
    primary: '#1e66f5',
    red: '#d20f39',
    green: '#40a02b',
    yellow: '#df8e1d',
    blue: '#1e66f5',
    accent: '#8839ef',
    mantle: '#e6e9ef',
    crust: '#dce0e8'
  },
  frappe: {
    background: '#303446',
    surface: '#292c3c',
    text: '#c6d0f5',
    subtle: '#a5adce',
    primary: '#8caaee',
    red: '#e78284',
    green: '#a6d189',
    yellow: '#e5c890',
    blue: '#8caaee',
    accent: '#ca9ee6',
    mantle: '#292c3c',
    crust: '#232634'
  },
  macchiato: {
    background: '#24273a',
    surface: '#1e2030',
    text: '#cad3f5',
    subtle: '#a5adcb',
    primary: '#8aadf4',
    red: '#ed8796',
    green: '#a6da95',
    yellow: '#eed49f',
    blue: '#8aadf4',
    accent: '#c6a0f6',
    mantle: '#1e2030',
    crust: '#181926'
  },
  mocha: {
    background: '#1e1e2e',
    surface: '#181825',
    text: '#cdd6f4',
    subtle: '#a6adc8',
    primary: '#89b4fa',
    red: '#f38ba8',
    green: '#a6e3a1',
    yellow: '#f9e2af',
    blue: '#89b4fa',
    accent: '#cba6f7',
    mantle: '#181825',
    crust: '#11111b'
  },
};
