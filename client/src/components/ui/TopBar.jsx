import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function TopBar({ children }) {
  const navigate = useNavigate();

  return (
    <AppBar position="fixed" sx={{ bgcolor: '#B00020', boxShadow: 2, zIndex: 1201 }}>
      <Toolbar sx={{ minHeight: 64, display: 'flex', justifyContent: 'space-between' }}>
        <Box onClick={() => navigate('/')} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}>
          <Box sx={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/logo.svg" alt="Painita" width={24} height={24} style={{ display: 'block', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </Box>
          <Typography variant="h5" sx={{ fontFamily: 'Playfair Display, serif', color: '#fff', letterSpacing: 2 }}>
            Painita
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {children}
          <Button onClick={() => navigate('/')} sx={{ color: '#fff', fontFamily: 'Nunito, Arial, sans-serif', fontWeight: 'bold' }}>
            Inicio
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
