import React from 'react'
import ReactDOM from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createTheme, ThemeProvider } from '@mui/material/styles'

import './index.css'
import { Home } from './container/Home/Home'
import { Meeting } from './container/Meeting/Meeting'
import reportWebVitals from './reportWebVitals'

const queryClient = new QueryClient()

const router = createHashRouter([
	{
		path: '/',
		element: <Home />,
		children: [
			{
				path: '/meeting/:id',
				element: <Meeting />,
			},
		],
	},
])

const theme = createTheme({
	palette: {
		primary: {
			light: '#F19333',
			main: '#EE7900',
			dark: '#A65400',
			contrastText: '#fff',
		},
		secondary: {
			light: '#5B5B5B',
			main: '#333333',
			dark: '#232323',
			contrastText: '#fff',
		},
	},
})

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<ThemeProvider theme={theme}>
				<RouterProvider router={router} />
			</ThemeProvider>
		</QueryClientProvider>
	</React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
