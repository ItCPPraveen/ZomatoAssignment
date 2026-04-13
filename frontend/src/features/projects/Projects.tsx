import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Box, Button, Typography, Paper, Grid, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/axios';
import toast from 'react-hot-toast';

interface Project {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
}

interface ProjectForm {
  name: string;
  description?: string;
}

export function Projects() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [openCreate, setOpenCreate] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProjectForm>();

  const { data, isLoading, error } = useQuery<{ projects: Project[] }>({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get('/projects');
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newProject: { name: string; description: string }) => {
      const res = await api.post('/projects', newProject);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setOpenCreate(false);
      reset();
      toast.success('Project created successfully!');
    },
    onError: () => {
      toast.error('Failed to create project');
    }
  });

  const onSubmit = (data: ProjectForm) => {
    createMutation.mutate({
      name: data.name,
      description: data.description || '',
    });
  };

  if (isLoading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;
  if (error) {
    toast.error('Failed to load projects');
    return null;
  }

  const projects = data?.projects || [];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Projects
        </Typography>
        <Button variant="contained" color="primary" onClick={() => setOpenCreate(true)}>
          New Project
        </Button>
      </Box>

      {projects.length === 0 ? (
        <Paper elevation={0} variant="outlined" sx={{ p: 6, textAlign: 'center', backgroundColor: '#fafafa' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No projects found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Get started by creating your first project!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
                }}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  {project.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                  {project.description || 'No description provided.'}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Created {new Date(project.created_at).toLocaleDateString()}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogContent dividers>
            <TextField
              {...register('name', { required: 'Project name is required' })}
              autoFocus
              margin="dense"
              id="name"
              label="Project Name"
              type="text"
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              {...register('description')}
              margin="dense"
              id="description"
              label="Description"
              type="text"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
