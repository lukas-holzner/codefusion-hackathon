import React from 'react'
import { Link } from 'react-router-dom'
import {
	Drawer as MuiDrawer,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Toolbar,
    Button,
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'

export const Drawer = ({
	isLargeScreen,
	mobileOpen,
	handleDrawerToggle,
	drawerWidth,
}) => {
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
				<List>
					<ListItem>
						<ListItemButton component={Link} to="/prep-meeting">
							<ListItemText primary="Prep Now" />
						</ListItemButton>
					</ListItem>
                    <ListItem disablePadding>
                        <ListItemText sx={{textAlign: 'center', backgroundColor: '#333333', color: '#fff'}} primary="-- KW 40 --" />
                    </ListItem>
					<ListItem>
                        <ListItemText sx={{textAlign: 'center'}} primary="Today" />
                    </ListItem>
					<ListItem disablePadding>
						<ListItemButton component={Link} to="/meeting:daily">
							<ListItemIcon>
								<MeetingRoomIcon />
							</ListItemIcon>
							<ListItemText primary="Daily" />
						</ListItemButton>
					</ListItem>
				</List>
			</div>
		</MuiDrawer>
	)
}
