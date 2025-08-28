import React, { useState } from 'react';
import { Drawer, Box, IconButton, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import SvgIcon from '@mui/material/SvgIcon';
import { useNavigate } from 'react-router-dom';

export default function NavMenu({ topOffset = 16 }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleGoHome = () => {
    setOpen(false);
    navigate('/');
  };

  return (
    <>
      <IconButton
        aria-label="menu"
        onClick={() => setOpen(true)}
        sx={{ position: 'fixed', top: topOffset, left: 16, zIndex: 1300, bgcolor: '#fff', boxShadow: 2 }}
      >
        <SvgIcon>
          <path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z" />
        </SvgIcon>
      </IconButton>
      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 260 }} role="presentation">
          <Box sx={{ px: 2, py: 2, borderBottom: '1px solid #eee' }}>
            <Typography variant="h6" sx={{ color: '#B00020', fontWeight: 'bold' }}>Menú</Typography>
          </Box>
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={handleGoHome}>
                <ListItemText primary="Inicio" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}
