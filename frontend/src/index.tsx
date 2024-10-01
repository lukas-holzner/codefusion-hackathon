import React from 'react'
import ReactDOM from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createTheme, ThemeProvider } from '@mui/material/styles'

import './index.css'
import { Home } from './container/Home/Home'
import { Meeting } from './container/Meeting/Meeting'
import reportWebVitals from './reportWebVitals'
import { PrepNow } from './container/PrepNow/PrepNow'
import AgendaList from './container/AgendaList/AgendaList'
import MeetingRoot from './container/Meeting/MeetingRoot'
import { UserProvider } from './utils/userProvider'
import MeetingNotes from './container/MeetingNotes/MeetingNotes'
import { AgendaProvider } from './utils/meetingAgenda'

const queryClient = new QueryClient()

const router = createHashRouter([
	{
		path: '/',
		element: <Home />,
		children: [
			{
				path: '/meeting',
				element: <MeetingRoot />,
        children: [
          {
            path: '/meeting/:id',
            element: <Meeting />,
          },
          {
            path: '/meeting/:id/agenda',
            element: <AgendaList />,
          },
          {
            path: '/meeting/:id/notes',
            element: <MeetingNotes />,
          },
        ],
			},
      {
        path: '/create-meeting',
        element: <PrepNow />,
      }
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
			light: '#B5B5B5',
			main: '#A3A3A3',
			dark: '#727272',
			contrastText: '#fff',
		},
	},
})

const element = document.getElementById('root')
if (!element) {
	throw new Error('No root element found')
}
const root = ReactDOM.createRoot(element)
root.render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<ThemeProvider theme={theme}>
				<UserProvider>
					<AgendaProvider>
							<RouterProvider router={router} />
					</AgendaProvider>
				</UserProvider>
			</ThemeProvider>
		</QueryClientProvider>
	</React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
