import {
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Typography,
    Divider,
    Box,
    Chip,
  } from "@mui/material";
  import SmartToyIcon from "@mui/icons-material/SmartToy";
  import PersonIcon from "@mui/icons-material/Person";
  
  interface Action {
    id: number;
    name: string;
    last_action_date?: string;
    last_action_by?: string;
    is_bot_action?: boolean;
  }
  
  interface ActivityTimelineProps {
    actions: Action[];
  }
  
  export const ActivityTimeline = ({ actions }: ActivityTimelineProps) => {
    const formatDate = (dateString?: string) => {
      if (!dateString) return "Unknown";

      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();

      // Handle just now case
      if (diffMs < 60000) {
        return "Just now";
      }

      // Calculate time differences more precisely
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      const diffWeeks = Math.floor(diffDays / 7);
      const diffMonths = Math.floor(diffDays / 30);

      // Return the most appropriate time format
      if (diffMins < 60) {
        return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      } else if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      } else if (diffWeeks < 4) {
        return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
      } else if (diffMonths < 12) {
        return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
      } else {
        // For anything older than a year, show the actual date
        return date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    };
  
    return (
      <List sx={{ width: "100%", bgcolor: "background.paper" }}>
        {actions.map((action, index) => (
          <Box key={action.id}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: action.is_bot_action ? "info.main" : "success.main" }}>
                  {action.is_bot_action ? <SmartToyIcon /> : <PersonIcon />}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography
                    variant="subtitle2"
                    color="text.primary"
                  >
                    {action.name}
                  </Typography>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {formatDate(action.last_action_date)}
                    </Typography>
                    <Chip
                      size="small"
                      label={action.is_bot_action ? "GitHub Actions Bot" : "User Action"}
                      color={action.is_bot_action ? "info" : "success"}
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                }
              />
            </ListItem>
            {index < actions.length - 1 && <Divider variant="inset" component="li" />}
          </Box>
        ))}
      </List>
    );
  };
  