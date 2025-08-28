import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LoginModal from '../LoginModal';

export default function TopBar({ children }) {
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = React.useState(false);

  return (
    <AppBar position="fixed" sx={{ bgcolor: '#B00020', boxShadow: 2, zIndex: 1201 }}>
      <Toolbar sx={{ minHeight: 64, display: 'flex', justifyContent: 'space-between' }}>
        <Box onClick={() => navigate('/')} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Playfair Display, serif',
              color: '#fff',
              letterSpacing: 2,
        fontSize: { xs: 28, sm: 32, md: 34 },
        fontWeight: 800
            }}
          >
            Painita
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {children}
          <Button
            onClick={() => setLoginOpen(true)}
            variant="contained"
            sx={{
              bgcolor: '#FFFFFF',
              color: '#B00020',
              fontWeight: 'bold',
              textTransform: 'none',
              fontFamily: 'Nunito, Arial, sans-serif',
              '&:hover': { bgcolor: '#FFE5E5' }
            }}
          >
            Iniciar sesión
          </Button>
        </Box>
      </Toolbar>
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={() => { setLoginOpen(false); navigate('/dashboard'); }}
      />
    </AppBar>
  );
}
