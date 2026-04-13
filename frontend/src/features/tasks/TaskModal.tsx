import { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormControl, InputLabel, Select, MenuItem, Box, FormHelperText } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/axios';

interface Task {
  id?: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
  assignee_id?: string;
}

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  task?: Task | null;
}

export function TaskModal({ open, onClose, projectId, task }: TaskModalProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<Task>({
    defaultValues: task || { status: 'todo', priority: 'medium', due_date: '' }
  });

  useEffect(() => {
    reset(task || { status: 'todo', priority: 'medium', due_date: '', title: '', description: '' });
  }, [task, reset]);

  const mutation = useMutation({
    mutationFn: async (taskData: any) => {
      if (task?.id) {
        const res = await api.patch(`/tasks/${task.id}`, taskData);
        return res.data;
      } else {
        const res = await api.post(`/projects/${projectId}/tasks`, taskData);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      onClose();
    }
  });

  const onSubmit = (data: Task) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{task?.id ? 'Edit Task' : 'Create Task'}</DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              {...register('title', { required: 'Title is required' })}
              autoFocus
              id="title"
              label="Task Title"
              type="text"
              fullWidth
              error={!!errors.title}
              helperText={errors.title?.message}
            />
            <TextField
              {...register('description')}
              id="description"
              label="Description"
              type="text"
              fullWidth
              multiline
              rows={3}
            />
            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Status">
                      <MenuItem value="todo">To Do</MenuItem>
                      <MenuItem value="in_progress">In Progress</MenuItem>
                      <MenuItem value="done">Done</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Priority">
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Box>
            <TextField
              {...register('due_date')}
              id="due_date"
              label="Due Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save Task'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
