import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../store/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../lib/axios';
import toast from 'react-hot-toast';

interface RegisterForm {
  name: string;
  email: string;
  password?: string;
}

export function Register() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);

    try {
      const response = await api.post('/auth/register', { name: data.name, email: data.email, password: data.password });
      login(response.data.token, response.data.user);
      toast.success('Successfully registered!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center" fontWeight="bold">
          Create Account
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            {...register('name', { required: 'Name is required' })}
            id="name"
            label="Full Name"
            type="text"
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            {...register('email', { required: 'Email is required' })}
            id="email"
            label="Email Address"
            type="email"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            {...register('password', { required: 'Password is required' })}
            id="password"
            label="Password"
            type="password"
            fullWidth
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            fullWidth
            sx={{ mt: 1 }}
          >
            {loading ? 'Registering...' : 'Sign Up'}
          </Button>
          
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Already have an account? <Link to="/login" style={{ color: '#e23744', textDecoration: 'none' }}>Log in</Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
