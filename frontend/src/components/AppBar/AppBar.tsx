import React from 'react'
import {
	AppBar as MuiAppBar,
	Toolbar,
	Typography,
	IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'

import { useUser } from '../../utils/userProvider';

import './AppBar.css';
import { useQuery } from '@tanstack/react-query';

const fetchUsers = async () => {
    const response = await fetch('https://codefusion.lholz.de/users/?skip=0&limit=100');
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return response.json();
};

export const AppBar = ({ handleDrawerToggle, mobileOpen }) => {
    const { userId, setUserId } = useUser();

    const { data: users } = useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers,
    });

    const handleChange = (event) => {
        setUserId(event.target.value);
    };


	return (
		<MuiAppBar
			position="fixed"
			sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, p: 1 }}
		>
			<Toolbar className='AppBar'>
				<IconButton
                    className='MenuButton'
					color="inherit"
					aria-label="open drawer"
					edge="start"
					onClick={handleDrawerToggle}
					sx={{ mr: 2 }}
				>
					{mobileOpen ? <CloseIcon /> : <MenuIcon />}
				</IconButton>
				<Typography variant="h6" noWrap component="div">
                    Prep Me Up Before I Go Go
				</Typography>
                <div className='UserSelector'>
                    <FormControl fullWidth>
                        <InputLabel id="user-select-label">Select User</InputLabel>
                        <Select
                            labelId="user-select-label"
                            id="user-select"
                            value={userId || ''}
                            label="Select User"
                            onChange={handleChange}
                            className='UserSelectContainer'
                        >
                            {users && users.map((user) => (
                                <MenuItem key={user.id} value={user.id}>{user.username}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>
			</Toolbar>
		</MuiAppBar>
	)
}