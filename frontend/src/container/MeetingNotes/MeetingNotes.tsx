import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  Box,
  CircularProgress,
  Switch,
  ListItemIcon
} from '@mui/material';

const noteStyles = {
  nextNote: {
    sx: {
      fontWeight: 'bold',
      color: 'black'
    }
  },
  openNote: {
    sx: {
      color: 'black'
    }
  },
  closedNote: {
    sx:
    {
      color: 'gray'
    }
  }
}

// Function to fetch agenda items
const fetchAgendaItems = async (meetingId) => {
  const response = await fetch(`/api/meetings/${meetingId}/agenda`);
  if (!response.ok) {
    throw new Error('Failed to fetch agenda items');
  }
  return [{ id: 1, title: 'hello there 1' }, { id: 2, title: 'by there 2' }, { id: 3, title: 'you are finished' }]

  return response.json();
};

export default function MeetingNotes() {
  const { id } = useParams();
  const [hideDoneFlag, setHideDoneFlag] = useState<boolean>(false)
  const [checkedNotes, setCheckedNotes] = useState<number[]>([])
  const [nextNoteId, setNextNoteId] = useState<number | undefined>(undefined)


  // Fetch agenda items
  const { data: notes, isLoading, isError } = useQuery({
    queryKey: ['agendaItems', id],
    queryFn: () => fetchAgendaItems(id),
  });

  // handle user interaction
  const checkNote = (id?: number) => {

    const nextCheckedNotes = [...checkedNotes]

    if (id) {
      const index = nextCheckedNotes.indexOf(id);
      if (index !== -1) {
        // id exists, so remove it
        nextCheckedNotes.splice(index, 1);
      } else {
        // id doesn't exist, so add it
        nextCheckedNotes.push(id);
      }
    }

    const nextNote = notes?.find((note) => !nextCheckedNotes.includes(note.id))

    setCheckedNotes(nextCheckedNotes);
    setNextNoteId(nextNote?.id)
  }

  // check the first note when the notes are loaded
  useEffect(() => {
    if (notes) {
      checkNote()
    }
  }, [notes]);


  const visibleNotes = useMemo(() => {
    if (hideDoneFlag) {
      return notes?.filter((note) => !checkedNotes.includes(note.id))
    }
    return notes
  }, [notes, checkedNotes, hideDoneFlag])

  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError) {
    return <Typography color="error">Error loading agenda items</Typography>;
  }

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Agenda for {id}
        <Switch
          onChange={() => setHideDoneFlag(!hideDoneFlag)}
          checked={!hideDoneFlag}
        ></Switch>
      </Typography>

      <Paper elevation={3}
        sx={{
          p: 1,
          borderRadius: 2,
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
        }}
      >
        <List >
          {visibleNotes?.map((note) => (
            <ListItem
              onClick={() => checkNote(note.id)}
              key={note.id}
              sx={
                ((note.id === nextNoteId) ? noteStyles.nextNote :
                  (checkedNotes.includes(note.id)) ? noteStyles.closedNote : noteStyles.openNote).sx}
            >
              <ListItemIcon>
                {(checkedNotes.includes(note.id)) ? <CheckCircleOutlineIcon /> : <RadioButtonUncheckedIcon />}
              </ListItemIcon>

              <ListItemText
                primary={note.title}
                primaryTypographyProps={
                  (note.id === nextNoteId) ? noteStyles.nextNote :
                    (checkedNotes.includes(note.id)) ? noteStyles.closedNote : noteStyles.openNote
                }

              />
            </ListItem>
          ))}
        </List>
        {
          (notes.length > 0 && visibleNotes.length === 0) &&
          <Typography>
            Done!
          </Typography>
        }
      </Paper>
    </Box>
  );
}