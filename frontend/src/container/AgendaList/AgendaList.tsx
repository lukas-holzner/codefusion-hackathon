import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Paper, 
  Button, 
  Box,
  CircularProgress
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { DropComponent } from '../../components/DropComponent/DropComponent';

// Function to fetch agenda items
const fetchAgendaItems = async (meetingId) => {
  const response = await fetch(`/api/meetings/${meetingId}/agenda`);
  return [{id: 1, title: 'hello there 1'}, {id: 2, title: 'by there 2'}, {id: 3, title: 'you are finished'}]
  if (!response.ok) {
    throw new Error('Failed to fetch agenda items');
  }
  return response.json();
};

// Function to save the reordered agenda items
const saveAgendaOrder = async ({ meetingId, items }) => {
  const response = await fetch(`/api/meetings/${meetingId}/agenda`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(items),
  });
  if (!response.ok) {
    throw new Error('Failed to save agenda order');
  }
  return response.json();
};

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export default function AgendaList() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  // Fetch agenda items
  const { data: agendaItems, isLoading, isError } = useQuery({
    queryKey: ['agendaItems', id],
    queryFn: () => fetchAgendaItems(id),
  });

  // Mutation for saving the reordered list
  const mutation = useMutation({
    mutationFn: saveAgendaOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(['agendaItems', id]);
    },
  });

  // Handle drag end
  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const items = reorder(
      agendaItems,
      result.source.index,
      result.destination.index
    );

    queryClient.setQueryData(['agendaItems', id], items);
  };

  // Handle save button click
  const handleSave = () => {
    mutation.mutate({ meetingId: id, items: agendaItems });
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError) {
    return <Typography color="error">Error loading agenda items</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Meeting Agenda for {id}
      </Typography>
      <DragDropContext onDragEnd={onDragEnd}>
        <DropComponent droppableId="agenda">
          {(provided) => (
            <Paper elevation={3}>
              <List {...provided.droppableProps} ref={provided.innerRef}>
                {agendaItems.map((item, index) => (
                  <Draggable key={item.id.toString()} draggableId={item.id.toString()} index={index}>
                    {(provided, snapshot) => (
                      <ListItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps} 
                        sx={{ 
                            bgcolor: snapshot.isDragging ? 'action.hover' : 'background.paper', 
                            mb: 1, 
                            cursor: 'grab',
                            '&:hover': { bgcolor: 'action.hover' },
                            '&:active': { cursor: 'grabbing'  },
                            // Improve touch interaction
                            '@media (hover: none)': {
                                '&:active': { bgcolor: 'action.selected'  }
                            }
                        }}
                      >
                        <Box
                          sx={{ 
                            mr: 2,
                          }}
                        >
                          <DragIndicatorIcon />
                        </Box>
                        <ListItemText primary={item.title} />
                      </ListItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </List>
            </Paper>
          )}
        </DropComponent>
      </DragDropContext>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleSave} 
        disabled={mutation.isPending}
        sx={{ mt: 2 }}
      >
        {mutation.isPending ? 'Saving...' : 'Save'}
      </Button>
    </Box>
  );
}