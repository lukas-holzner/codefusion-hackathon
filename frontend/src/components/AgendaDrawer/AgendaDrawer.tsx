import React from "react";
import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import CircleIcon from '@mui/icons-material/Circle';

type AgendaItem = {
    agenda_item: string;
    completed: boolean;
}

type AgendaDrawerProps = {
    agendaItems: AgendaItem[];
    isOpen: boolean;
    onClose: () => void;
}

export const AgendaDrawerWidth = 250;

export const AgendaDrawer: React.FC<AgendaDrawerProps> = ({ agendaItems, isOpen, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const drawerContent = (
    <List>
      <Typography variant="h6" sx={{ p: 2, mt: 8 }}>
        Agenda
      </Typography>
      {agendaItems.map((item, index) => (
        <ListItem key={index}>
            <ListItemIcon sx={{ minWidth: '16px' }}>
                <CircleIcon sx={{width: '8px', height: '8px'}} />
            </ListItemIcon>
            <ListItemText primary={item.agenda_item} />
        </ListItem>
      ))}
    </List>
  );

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      variant={isMobile ? "temporary" : "permanent"}
      sx={{
        width: AgendaDrawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: AgendaDrawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};