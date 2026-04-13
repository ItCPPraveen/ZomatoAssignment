import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuth } from '../../store/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', cursor: 'pointer' }} onClick={() => navigate('/')}>
          TaskFlow
        </Typography>
        {isAuthenticated ? (
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body1">
              Welcome, {user?.name}
            </Typography>
            <Button color="inherit" onClick={handleLogout} variant="outlined">
              Logout
            </Button>
          </Box>
        ) : (
          <Box>
            <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
            <Button color="inherit" onClick={() => navigate('/register')}>Register</Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
