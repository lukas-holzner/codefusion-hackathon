import logo from '../../logo.svg'
import './Home.css'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  CircularProgress,
} from '@mui/material'

const fetchMeetingIds = async () => {
  const response = await fetch('/api/meeting-ids')
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  return response.json()
}

export const Home = () => {
  const [selectedMeetingId, setSelectedMeetingId] = useState('')

  const {
    data: meetingIds,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['meetingIds'],
    queryFn: fetchMeetingIds,
  })

  const handleMeetingIdChange = (event) => {
    setSelectedMeetingId(event.target.value)
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Welcome to the codefusion frontend</p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="meeting-id-select-label">Meeting ID</InputLabel>
          {isPending ? (
            <CircularProgress size={24} />
          ) : isError ? (
            <p>Error loading meeting IDs</p>
          ) : (
            <Select
              labelId="meeting-id-select-label"
              id="meeting-id-select"
              value={selectedMeetingId}
              label="Meeting ID"
              onChange={handleMeetingIdChange}
            >
              {meetingIds?.map((id) => (
                <MenuItem key={id} value={id}>
                  {id}
                </MenuItem>
              ))}
            </Select>
          )}
        </FormControl>
      </header>
    </div>
  )
}
