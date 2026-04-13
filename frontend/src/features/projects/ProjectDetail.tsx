import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Typography, CircularProgress, Button, Grid, Paper } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, DragEndEvent, closestCorners, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import toast from 'react-hot-toast';
import { api } from '../../lib/axios';
import { TaskModal } from '../tasks/TaskModal';
import { SortableTaskCard } from './SortableTaskCard';
function ProjectColumn({ column, columnTasks, setEditingTask, setModalOpen, taskIds }: any) {
  const { setNodeRef } = useDroppable({ id: column.id });
  return (
    <Grid item xs={12} md={4}>
      <Paper ref={setNodeRef} id={column.id} elevation={0} sx={{ p: 2, backgroundColor: '#f4f5f7', minHeight: 500, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" mb={2} gap={1}>
          <Box width={12} height={12} borderRadius="50%" bgcolor={column.color} />
          <Typography variant="h6" fontWeight="bold">
            {column.label}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
            {columnTasks.length}
          </Typography>
        </Box>

        <SortableContext id={column.id} items={taskIds} strategy={verticalListSortingStrategy}>
          <Box minHeight={400}>
            {columnTasks.map((task: any) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onClick={() => {
                  setEditingTask(task);
                  setModalOpen(true);
                }}
              />
            ))}
          </Box>
        </SortableContext>
      </Paper>
    </Grid>
  );
}


export function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  const { data: project, isLoading, error } = useQuery<any>({
    queryKey: ['projects', id],
    queryFn: async () => {
      const res = await api.get(`/projects/${id}`);
      return res.data;
    }
  });

  const deleteProject = useMutation({
    mutationFn: async () => {
      await api.delete(`/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted');
      navigate('/');
    }
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      await api.patch(`/tasks/${taskId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
      toast.success('Task updated');
    },
    onError: () => {
      toast.error('Failed to move task');
    }
  });

  if (isLoading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;
  if (error || !project) {
    toast.error('Failed to load project details');
    return null;
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    // active.id is the dragged task's ID
    const taskId = active.id as string;

    // If dropped over a task, it's inside a sortable container, so we get the containerId (the status).
    // If dropped on the column directly (optional), we get over.id.
    const newStatus = (over.data.current?.sortable?.containerId || over.id) as string;



    const draggedTask = project.tasks.find((t: any) => t.id === taskId);
    console.log('newStatus', draggedTask, newStatus);

    if (draggedTask && draggedTask.status !== newStatus && ['todo', 'in_progress', 'done'].includes(newStatus)) {
      updateTaskStatus.mutate({ taskId, status: newStatus });
    }
  };

  const statuses = [
    { id: 'todo', label: 'To Do', color: '#e3e4e6' },
    { id: 'in_progress', label: 'In Progress', color: '#cceecb' },
    { id: 'done', label: 'Done', color: '#dcf1f9' }
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            {project.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {project.description}
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button variant="outlined" color="error" onClick={() => {
            if (window.confirm('Are you sure you want to delete this project?')) {
              deleteProject.mutate();
            }
          }}>
            Delete Project
          </Button>
          <Button variant="contained" color="primary" onClick={() => {
            setEditingTask(null);
            setModalOpen(true);
          }}>
            Add Task
          </Button>
        </Box>
      </Box>

      <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <Grid container spacing={3}>
          {statuses.map(column => {
            const columnTasks = project.tasks.filter((t: any) => t.status === column.id);
            return (
              <ProjectColumn 
                key={column.id} 
                column={column} 
                columnTasks={columnTasks} 
                taskIds={columnTasks.map((t: any) => t.id)}
                setEditingTask={setEditingTask}
                setModalOpen={setModalOpen}
              />
            )
          })}
        </Grid>
      </DndContext>

      {id && (
        <TaskModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          projectId={id}
          task={editingTask}
        />
      )}
    </Box>
  );
}
