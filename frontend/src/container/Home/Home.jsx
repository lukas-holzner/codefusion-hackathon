import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import {
	Box,
	CssBaseline,
	Toolbar,
	useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { AppBar } from '../../components/AppBar/AppBar'
import { MenuDrawer } from '../../components/MeetingsDrawer/MeetingsDrawer'

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
					<MenuDrawer
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
					<Outlet />
				</Box>
			</Box>
		</div>
	)
}
