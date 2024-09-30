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
    Divider,
    Button,
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'

import './Drawer.css'

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
                <div className="ButtonWrapper">
                    <Button variant="outlined" href="#/prep-now">
                        Prep Now
                    </Button>
                </div>
				<List>
                    <ListItem disablePadding component="h2"sx={{justifyContent: 'flex-start', paddingLeft: '12px'}}>
                        KW 40
                    </ListItem>
					<ListItem disablePadding>
						<ListItemButton component={Link} to="/meeting/daily">
							<ListItemIcon>
								<MeetingRoomIcon />
							</ListItemIcon>
							<ListItemText primary="Daily" />
						</ListItemButton>
					</ListItem>
					<ListItem disablePadding>
						<ListItemButton component={Link} to="/meeting/tech-discussion-authorisation">
							<ListItemIcon>
								<MeetingRoomIcon />
							</ListItemIcon>
							<ListItemText primary="Tech discussion - Authorisation" />
						</ListItemButton>
					</ListItem>
					<ListItem component="h4" alignItems="center" sx={{justifyContent: 'center', margin: '0px'}}>
                        Tomorrow
                    </ListItem>
                    <Divider />
					<ListItem disablePadding>
						<ListItemButton component={Link} to="/meeting/daily">
							<ListItemIcon>
								<MeetingRoomIcon />
							</ListItemIcon>
							<ListItemText primary="Daily" />
						</ListItemButton>
					</ListItem>
					<ListItem disablePadding>
						<ListItemButton component={Link} to="/meeting/refinement">
							<ListItemIcon>
								<MeetingRoomIcon />
							</ListItemIcon>
							<ListItemText primary="Refinement" />
						</ListItemButton>
					</ListItem>
					<ListItem component="h4" alignItems="center" sx={{justifyContent: 'center', margin: '0px'}}>
                        Wednesday
                    </ListItem>
                    <Divider />
					<ListItem disablePadding>
						<ListItemButton component={Link} to="/meeting/daily">
							<ListItemIcon>
								<MeetingRoomIcon />
							</ListItemIcon>
							<ListItemText primary="Daily" />
						</ListItemButton>
					</ListItem>
					<ListItem disablePadding>
						<ListItemButton component={Link} to="/meeting/retro">
							<ListItemIcon>
								<MeetingRoomIcon />
							</ListItemIcon>
							<ListItemText primary="Retro" />
						</ListItemButton>
					</ListItem>
                    <ListItem disablePadding component="h2"sx={{justifyContent: 'flex-start', paddingLeft: '12px'}}>
                        KW 41
                    </ListItem>
                    <ListItem component="h4" alignItems="center" sx={{justifyContent: 'center', margin: '0px'}}>
                        Monday
                    </ListItem>
                    <Divider />
                    <ListItem disablePadding>
						<ListItemButton component={Link} to="/meeting/daily">
							<ListItemIcon>
								<MeetingRoomIcon />
							</ListItemIcon>
							<ListItemText primary="Daily" />
						</ListItemButton>
					</ListItem>
                    <ListItem disablePadding>
						<ListItemButton component={Link} to="/meeting/authentication-workshop">
							<ListItemIcon>
								<MeetingRoomIcon />
							</ListItemIcon>
							<ListItemText primary="Authentication Workshop" />
						</ListItemButton>
					</ListItem>
				</List>
			</div>
		</MuiDrawer>
	)
}
