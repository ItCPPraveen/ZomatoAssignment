import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Paper, Box, Typography, Chip, Button, Icon } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

export function SortableTaskCard({ task, onClick }: { task: any, onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      variant="outlined"
      sx={{
        p: 2,
        mb: 2,
        cursor: 'grab',
        backgroundColor: '#fff',
        '&:active': { cursor: 'grabbing' },
        '&:hover': { backgroundColor: '#fafafa' }
      }}
    // onClick={() => {
    //   if (!isDragging) onClick();
    // }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box pr={1}>
          <Typography variant="subtitle1" fontWeight="bold" lineHeight={1.2} mb={0.5}>{task.title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {task.description}
          </Typography>
        </Box>
        <EditIcon
          sx={{ cursor: 'pointer' }}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        />
      </Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
        <Chip label={task.priority} color={getPriorityColor(task.priority) as any} size="small" variant="filled" />
        {task.due_date && (
          <Typography variant="caption" color="text.disabled">
            {new Date(task.due_date).toLocaleDateString()}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
