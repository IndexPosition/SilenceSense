import React from 'react';
import UploadForm from './components/UploadForm';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0288d1',
    },
    secondary: {
      main: '#ff7043', 
    },
    background: {
      default: '#fafafa',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h4: {
      fontWeight: 700,
      color: '#01579b',
    },
    h6: {
      fontWeight: 600,
      color: '#0288d1',
    },
    body1: {
      color: '#424242',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          padding: '12px 24px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          transition: 'background-color 0.3s, transform 0.3s',
          '&:hover': {
            backgroundColor: '#01579b',
            transform: 'scale(1.05)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '15px',
          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <CssBaseline />
        <UploadForm />
      </div>
    </ThemeProvider>
  );
}

export default App;
