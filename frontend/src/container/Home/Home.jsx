import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Routes, Route } from 'react-router-dom'
import {
	Box,
	CssBaseline,
	Toolbar,
	Typography,
	useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { AppBar } from '../../components/AppBar/AppBar'
import { Drawer } from '../../components/drawer/Drawer'

const drawerWidth = 350

export const Home = () => {
	const [mobileOpen, setMobileOpen] = useState(false)
	const theme = useTheme()
	const isLargeScreen = useMediaQuery(theme.breakpoints.up('sm'))

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen)
	}

	return (
		<div>
			<Box sx={{ display: 'flex' }}>
				<CssBaseline />
				<AppBar
					handleDrawerToggle={handleDrawerToggle}
					mobileOpen={mobileOpen}
				/>
				<Box
					component="nav"
					sx={{
						width: { sm: mobileOpen ? '100%' : drawerWidth },
						flexShrink: { sm: 0 },
					}}
				>
					<Drawer
						isLargeScreen={isLargeScreen}
						mobileOpen={mobileOpen}
						handleDrawerToggle={handleDrawerToggle}
						drawerWidth={drawerWidth}
					/>
				</Box>
				<Box
					component="main"
					sx={{
						flexGrow: 1,
						p: 3,
						width: {
							sm: `calc(100% - ${
								mobileOpen ? '0px' : drawerWidth
							}px)`,
						},
					}}
				>
					<Toolbar />
					<Routes>
						<Route
							path="/"
							element={
								<Typography>
									Welcome to the Meeting App!
								</Typography>
							}
						/>
						<Route
							path="/meeting/:id"
							element={<MeetingSelector />}
						/>
					</Routes>
				</Box>
			</Box>
		</div>
	)
}

// MeetingSelector component (in a separate file)
export const MeetingSelector = () => {
	// ... (previous MeetingSelector code)
}
