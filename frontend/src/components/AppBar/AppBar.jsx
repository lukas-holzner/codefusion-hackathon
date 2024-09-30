import React from 'react'
import {
	AppBar as MuiAppBar,
	Toolbar,
	Typography,
	IconButton,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'

export const AppBar = ({ handleDrawerToggle, mobileOpen }) => {
	return (
		<MuiAppBar
			position="fixed"
			sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
		>
			<Toolbar>
				<IconButton
					color="inherit"
					aria-label="open drawer"
					edge="start"
					onClick={handleDrawerToggle}
					sx={{ mr: 2 }}
				>
					{mobileOpen ? <CloseIcon /> : <MenuIcon />}
				</IconButton>
				<Typography variant="h6" noWrap component="div">
					Meeting App
				</Typography>
			</Toolbar>
		</MuiAppBar>
	)
}
