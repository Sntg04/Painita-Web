import { createTheme } from '@mui/material/styles';
import palette from './palette';

const theme = createTheme({
  palette: {
    primary: {
      main: palette.rojoPainita,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: palette.acento,
    },
    text: {
      primary: palette.texto,
    },
    background: {
      default: palette.fondo,
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: [
      'Playfair Display',
      'Nunito',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontFamily: 'Playfair Display',
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontFamily: 'Playfair Display',
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontFamily: 'Playfair Display',
      fontWeight: 500,
      fontSize: '1.5rem',
    },
    body1: {
      fontFamily: 'Nunito',
      fontWeight: 400,
      fontSize: '1rem',
    },
    body2: {
      fontFamily: 'Nunito',
      fontWeight: 400,
      fontSize: '0.95rem',
    },
    button: {
      fontFamily: 'Nunito',
      fontWeight: 600,
      fontSize: '1rem',
      textTransform: 'none',
    },
    subtitle1: {
      fontFamily: 'Nunito',
      fontWeight: 500,
      fontSize: '1.1rem',
    },
    subtitle2: {
      fontFamily: 'Nunito',
      fontWeight: 400,
      fontSize: '1rem',
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#BDBDBD',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#909090',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: palette.rojoPainita,
          },
          '&.Mui-focused': { boxShadow: 'none' },
          '&:focus-within': { boxShadow: 'none' },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            color: palette.rojoPainita,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16
        }
      }
    },
    MuiSlider: {
      styleOverrides: {
        thumb: {
          backgroundColor: palette.rojoPainita
        },
        track: {
          backgroundColor: palette.rojoPainita
        },
        rail: {
          backgroundColor: palette.rojoPainita
        }
      }
    }
  }
});

export default theme;
