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
import { useUser } from '../../utils/userProvider';
import { fetchConversation } from '../../utils/fetchRequests';

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

export default function MeetingNotes() {
  const { id: meetingId } = useParams();
  const { userId } = useUser();
  const [hideDoneFlag, setHideDoneFlag] = useState<boolean>(true)
  const [checkedNotes, setCheckedNotes] = useState<number[]>([])
  const [nextNoteId, setNextNoteId] = useState<number | undefined>(undefined)


  // Fetch agenda items
  const { data: _notes, isLoading, isError } = useQuery({
    queryKey: ['agendaItems', meetingId, userId],
    queryFn: () => fetchConversation({ meetingId: parseInt(meetingId ?? '0'), userId }),
    enabled: !!userId && !!meetingId,
  });

  const notes = useMemo(() => _notes?.meeting_agenda.map(
    (item,index) => ({ id: index+1, title: item.agenda_item, done: item.completed }))
    , [_notes]
  )

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

    if (!notes) return []
    if (hideDoneFlag) {
      return notes.filter((note) => !checkedNotes.includes(note.id))
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
        gutterBottom
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Agenda for {meetingId}
        <Switch
          onChange={() => setHideDoneFlag(!hideDoneFlag)}
          checked={!hideDoneFlag}
        ></Switch>
      </Typography>
      <Paper elevation={3}>
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
          (notes.length > 0 && visibleNotes?.length === 0) &&
          <Typography>
            Done!
          </Typography>
        }
      </Paper>
    </Box>
  );
}