// @ts-nocheck

import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
	Drawer as MuiDrawer,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Toolbar,
	Divider,
	Button,
	CircularProgress,
	Typography,
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'

import './MeetingsDrawer.css'

const fetchMeetings = async () => {
	const response = await fetch('https://codefusion.lholz.de/meetings/?skip=0&limit=100')
	if (!response.ok) {
		throw new Error('Failed to fetch meetings')
	}
	return response.json()
}

const groupMeetingsByWeek = (meetings) => {
	const grouped = {}
	meetings.forEach(meeting => {
		const date = new Date(meeting.date)
		const weekNumber = getWeekNumber(date)
		const dayName = getDayName(date)

		if (!grouped[weekNumber]) {
			grouped[weekNumber] = {}
		}
		if (!grouped[weekNumber][dayName]) {
			grouped[weekNumber][dayName] = []
		}
		grouped[weekNumber][dayName].push(meeting)
	})
	return grouped
}

const getWeekNumber = (date) => {
	const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
	const dayNum = d.getUTCDay() || 7
	d.setUTCDate(d.getUTCDate() + 4 - dayNum)
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
	return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

const getDayName = (date) => {
	// TODO add a marker for 
	return date.toLocaleDateString('en-US', { weekday: 'long' })
}

export const MeetingsDrawer = ({
	isLargeScreen,
	mobileOpen,
	handleDrawerToggle,
	drawerWidth,
}) => {
	const { data: meetings, isLoading, isError } = useQuery({
		queryKey: ['meetings'],
		queryFn: fetchMeetings,
	})

	const groupedMeetings = meetings ? groupMeetingsByWeek(meetings) : {}

	const renderMeetings = () => {
		return Object.entries(groupedMeetings).map(([weekNumber, days], index) => (
			<React.Fragment key={weekNumber}>
				{index !== 0 && (
					<>
						<ListItem disablePadding component="h2" sx={{ justifyContent: 'flex-start', paddingLeft: '32px' }}>
							KW {weekNumber}
						</ListItem>
						<Divider />
					</>
				)}

				{Object.entries(days).map(([day, dayMeetings]) => (
					<React.Fragment key={day}>
						<ListItem component="h4" sx={{ margin: '8px 0', paddingLeft: '32px' }}>
							{day}
						</ListItem>
						{dayMeetings.map(meeting => (
							<ListItem disablePadding key={meeting.id}>
								<ListItemButton component={Link} to={`/meeting/${meeting.id}`} sx={{paddingLeft: '32px'}}>
									<ListItemIcon sx={{minWidth: '32px'}}>
										<MeetingRoomIcon />
									</ListItemIcon>
									<ListItemText primary={meeting.title} />
								</ListItemButton>
							</ListItem>
						))}
					</React.Fragment>
				))}
			</React.Fragment>
		))
	}

	return (
		<MuiDrawer
			variant={isLargeScreen ? 'permanent' : 'temporary'}
			open={isLargeScreen || mobileOpen}
			onClose={handleDrawerToggle}
			ModalProps={{
				keepMounted: true, // Better open performance on mobile.
			}}
			sx={{
				width: mobileOpen ? '100%' : drawerWidth,
				flexShrink: 0,
				'& .MuiDrawer-paper': {
					boxSizing: 'border-box',
					width: mobileOpen ? '100%' : drawerWidth,
				},
			}}
		>
			<div>
				<Toolbar />
				<div className="ButtonWrapper">
					<Button variant="outlined" href="#/create-meeting">
						Create New Meeting
					</Button>
				</div>
				<List>
					{isLoading ? (
						<CircularProgress />
					) : isError ? (
						<Typography color="error">Error loading meetings</Typography>
					) : (
						renderMeetings()
					)}
				</List>
			</div>
		</MuiDrawer>
	)
}
