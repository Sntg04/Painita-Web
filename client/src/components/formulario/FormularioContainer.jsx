import { Box, Paper } from '@mui/material';

export default function FormularioContainer({ children }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: '#F9F9F9',
        px: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          maxWidth: 500,
          width: '100%',
          p: 5,
          borderRadius: 4,
          textAlign: 'center',
          bgcolor: '#fff',
        }}
      >
        {children}
      </Paper>
    </Box>
  );
}
