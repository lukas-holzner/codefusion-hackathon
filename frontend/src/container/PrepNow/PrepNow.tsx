import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  Snackbar,
  Alert,
  SelectChangeEvent,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface MeetingFormData {
  title: string;
  description: string;
  date: Date | null;
  meeting_type: string;
}

const createMeeting = async (meetingData: MeetingFormData): Promise<any> => {
  const response = await fetch(`https://codefusion.lholz.de/meetings/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(meetingData),
  });

  if (!response.ok) {
    throw new Error('Failed to create meeting');
  }

  return response.json();
};

export const PrepNow: React.FC = () => {
  const nowIsh = new Date()
  nowIsh.setMinutes(0)
  nowIsh.setHours(nowIsh.getHours() + 1 )

  const [formData, setFormData] = useState<MeetingFormData>({
    title: "",
    description: "",
    date: nowIsh,
    meeting_type: "",
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      setSnackbar({ open: true, message: 'Meeting created successfully!', severity: 'success' });
      resetForm();
    },
    onError: (error) => {
      console.error('Error creating meeting:', error);
      setSnackbar({ open: true, message: 'Failed to create meeting. Please try again.', severity: 'error' });
    },
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDateChange = (newDate: Date | null) => {
    setFormData((prevData) => ({
      ...prevData,
      date: newDate,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const meetingData: MeetingFormData = {
      ...formData,
      date: formData.date ? formData.date : null,
    };
    mutation.mutate(meetingData);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: null,
      meeting_type: "",
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Meeting
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={4}
          />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Date and Time"
              value={formData.date}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: "normal",
                  required: true
                }
              }}
            />
          </LocalizationProvider>
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="meeting-type-label">Meeting Type</InputLabel>
            <Select
              labelId="meeting-type-label"
              name="meeting_type"
              value={formData.meeting_type}
              onChange={(event: SelectChangeEvent<string>) => handleChange(event as React.ChangeEvent<HTMLInputElement>)}
              label="Meeting Type"
            >
              <MenuItem value="standup">Stand-up</MenuItem>
              <MenuItem value="planning">Planning</MenuItem>
              <MenuItem value="retrospective">Retrospective</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Creating...' : 'Create Meeting'}
          </Button>
        </form>
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};