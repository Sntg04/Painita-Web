import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LoginModal from '../LoginModal';

export default function TopBar({ children }) {
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = React.useState(false);

  return (
    <AppBar position="fixed" square sx={{ bgcolor: '#B00020', boxShadow: 2, zIndex: 1201, left: 0, right: 0, borderRadius: 0 }}>
      <Toolbar disableGutters sx={{ minHeight: 64, display: 'flex', justifyContent: 'space-between', px: 2 }}>
        <Box onClick={() => navigate('/')} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Playfair Display, serif',
              color: '#fff',
              letterSpacing: 2,
        fontSize: { xs: 22, sm: 26, md: 30 },
        fontWeight: 800,
        lineHeight: 1.1
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
              px: { xs: 1.5, sm: 2 },
              py: { xs: 0.5, sm: 0.75 },
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              minWidth: { xs: 110, sm: 140 },
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
