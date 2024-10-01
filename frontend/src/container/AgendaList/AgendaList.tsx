import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { useUser } from '../../utils/userProvider';
import { fetchConversation, fetchMeetingDetails } from '../../utils/fetchRequests';

// Function to fetch agenda items
// const fetchAgendaItems = async (meetingId, userId) => {
//   const response = await fetch(`https://codefusion.lholz.de/meetings/${meetingId}/${userId}/conversation`);

//   if (!response.ok) {
//     throw new Error('Failed to fetch agenda items');
//   }
//   return response.json();
// };

// Function to save the reordered agenda items
const saveAgendaOrder = async ({ meetingId, userId, items }) => {
  const response = await fetch(`https://codefusion.lholz.de/meetings/${meetingId}/${userId}/conversation/update_agenda`, {
    method: 'POST',
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
  const { userId } = useUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: meetingDetails } = useQuery({
    queryKey: ['meeting', id],
    queryFn: () => fetchMeetingDetails({meetingId: parseInt(`${id ?? '0'}`, 10 )}),
    enabled: !!id,
  });

  const { data: agendaItems, isLoading, isError } = useQuery({
    queryKey: ['agendaItems', id, userId],
    queryFn: () => fetchConversation({meetingId: parseInt(`${id ?? '0'}`, 10 ), userId}),
    enabled: !!id && !!userId,
  });

  // Mutation for saving the reordered list
  const mutation = useMutation({
    mutationFn: saveAgendaOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendaItems', id, userId] });
    },
  });

  useEffect(() => {
    if(agendaItems && agendaItems.meeting_agenda.length === 0) {
      navigate(`/meeting/${id}`);
    }
  }, [agendaItems]);

  // Handle drag end
  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const items = reorder(
      agendaItems.meeting_agenda,
      result.source.index,
      result.destination.index
    );

    queryClient.setQueryData(['agendaItems', id, userId], {...agendaItems, meeting_agenda: items});
  };

  // Handle save button click
  const handleSave = () => {
    mutation.mutate({ meetingId: id, userId, items: agendaItems.meeting_agenda });
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
        Meeting Agenda for {meetingDetails ? meetingDetails.title : '. . .'}
      </Typography>
      <DragDropContext onDragEnd={onDragEnd}>
        <DropComponent droppableId="agenda">
          {(provided) => (
            <Paper elevation={3}>
              <List {...provided.droppableProps} ref={provided.innerRef}>
                {agendaItems && agendaItems.meeting_agenda.map((item, index) => (
                  <Draggable key={`${index}-${item.agenda_item}`} draggableId={`${index}-${item.agenda_item}`} index={index}>
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
                        <ListItemText primary={item.agenda_item} />
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