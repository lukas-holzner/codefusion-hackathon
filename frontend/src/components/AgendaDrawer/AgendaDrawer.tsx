import React, { useEffect, useState } from "react";
import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import { useAgenda } from "../../utils/meetingAgenda";


export const AgendaDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { agendaItems } = useAgenda();

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" || (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }
    setIsOpen(open);
  };

  useEffect(() => {
    if (agendaItems.length > 0 && !isMobile) {
      setIsOpen(true);
    }
  }, [agendaItems]);

  const drawerContent = (
    <List>
      <Typography variant="h6" sx={{ p: 2 }}>
        Agenda
      </Typography>
      {agendaItems.map((item, index) => (
        <ListItem key={index}>
          <ListItemText primary={item} />
        </ListItem>
      ))}
    </List>
  );

  return (
    <>
      {isMobile && (
        <IconButton
          onClick={toggleDrawer(true)}
          sx={{ position: "fixed", right: 16, top: 16, zIndex: 1100 }}
        >
          <FormatListBulletedIcon />
        </IconButton>
      )}
      <Drawer
        anchor="right"
        open={isMobile ? isOpen : true}
        onClose={toggleDrawer(false)}
        variant={isMobile ? "temporary" : "permanent"}
        sx={{
          width: 150,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 150,
            boxSizing: "border-box",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};