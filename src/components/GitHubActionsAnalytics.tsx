// GitHubActionsAnalytics.tsx
import { useState, useEffect } from "react";
import { 
  Paper, 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  Chip, 
  Divider,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Tooltip,
  IconButton
} from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LoopIcon from "@mui/icons-material/Loop";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { HeatCalendar, generateCalendarData } from "./HeatCalendar";
import { PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

// Interface for GitHub Actions data
interface GitHubAction {
  id: number;
  repo: string;
  workflow: string;
  status: "success" | "failure" | "running";
  timestamp: string;
  actor: string;
  duration: number; // in seconds
  is_bot: boolean;
}

interface GitHubActionsAnalyticsProps {
  repoNames: string[];
}

export const GitHubActionsAnalytics = ({ repoNames }: GitHubActionsAnalyticsProps) => {
  const [actions, setActions] = useState<GitHubAction[]>([]);
  const [calendarData, setCalendarData] = useState(generateCalendarData());
  
  useEffect(() => {
    // Generate simulated GitHub Actions data
    const actionTypes = ['CI', 'Deploy', 'Test', 'Build', 'Lint'];
    const simulatedActions = [];
    
    for (let i = 0; i < 20; i++) {
      const repo = repoNames[Math.floor(Math.random() * repoNames.length)];
      const workflow = actionTypes[Math.floor(Math.random() * actionTypes.length)];
      const isBot = Math.random() > 0.3; // 70% chance of being a bot action
      const statuses = ["success", "failure", "running"] as const;
      const status = statuses[Math.floor(Math.random() * (statuses.length - 0.2))]; // Bias toward success
      
      // Generate a random timestamp within the last 7 days
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 7));
      date.setHours(Math.floor(Math.random() * 24));
      date.setMinutes(Math.floor(Math.random() * 60));
      
      simulatedActions.push({
        id: i,
        repo,
        workflow: `${workflow} Workflow`,
        status,
        timestamp: date.toISOString(),
        actor: isBot ? "github-actions[bot]" : "user-" + Math.floor(Math.random() * 10),
        duration: Math.floor(Math.random() * 300) + 20, // 20-320 seconds
        is_bot: isBot
      });
    }
    
    // Sort by timestamp (newest first)
    simulatedActions.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    setActions(simulatedActions);
    
    // Generate calendar data with more realistic intensity
    setCalendarData(generateCalendarData(2));
  }, [repoNames]);
  
  // Calculate statistics
  const totalActions = actions.length;
  const botActions = actions.filter(a => a.is_bot).length;
  const userActions = totalActions - botActions;
  const successfulActions = actions.filter(a => a.status === "success").length;
  const failedActions = actions.filter(a => a.status === "failure").length;
  const runningActions = actions.filter(a => a.status === "running").length;
  
  // Average duration
  const avgDuration = actions.reduce((sum, action) => sum + action.duration, 0) / totalActions;
  
  // Pie chart data
  const botVsUserData = [
    { name: "Bot Actions", value: botActions },
    { name: "User Actions", value: userActions },
  ];
  
  const statusData = [
    { name: "Success", value: successfulActions },
    { name: "Failed", value: failedActions },
    { name: "Running", value: runningActions },
  ];
  
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  const STATUS_COLORS = { success: "#4caf50", failure: "#f44336", running: "#2196f3" };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        GitHub Actions Analytics
      </Typography>
      
      {/* Overview cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Actions
              </Typography>
              <Typography variant="h4">{totalActions}</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Chip 
                  icon={<SmartToyIcon />} 
                  label={`Bot: ${botActions}`} 
                  size="small" 
                  variant="outlined"
                />
                <Chip 
                  icon={<PersonIcon />} 
                  label={`User: ${userActions}`} 
                  size="small" 
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Success Rate
              </Typography>
              <Typography variant="h4">
                {Math.round((successfulActions / (successfulActions + failedActions)) * 100)}%
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip 
                  icon={<CheckCircleIcon />} 
                  label={`${successfulActions} successful`} 
                  size="small" 
                  color="success"
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Average Duration
              </Typography>
              <Typography variant="h4">{formatDuration(Math.round(avgDuration))}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                For all completed workflow runs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Current Status
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  icon={<CheckCircleIcon />} 
                  label={`${successfulActions} passed`} 
                  size="small" 
                  color="success"
                />
                <Chip 
                  icon={<ErrorIcon />} 
                  label={`${failedActions} failed`} 
                  size="small" 
                  color="error"
                />
                <Chip 
                  icon={<LoopIcon />} 
                  label={`${runningActions} running`} 
                  size="small" 
                  color="info"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts and lists */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Actions Distribution</Typography>
            <Box sx={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={botVsUserData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {botVsUserData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Actions Activity (Last 12 Weeks)</Typography>
            <Box sx={{ height: 200 }}>
              <HeatCalendar data={calendarData} />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Recent GitHub Actions</Typography>
            <List>
              {actions.slice(0, 5).map((action) => (
                <Box key={action.id}>
                  <ListItem sx={{ py: 1.5 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: STATUS_COLORS[action.status] }}>
                        {action.status === "success" ? (
                          <CheckCircleIcon />
                        ) : action.status === "running" ? (
                          <LoopIcon />
                        ) : (
                          <ErrorIcon />
                        )}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">
                            {action.workflow} 
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            in {action.repo}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarTodayIcon fontSize="small" />
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(action.timestamp)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            <Chip
                              size="small"
                              icon={action.is_bot ? <SmartToyIcon /> : <PersonIcon />}
                              label={action.is_bot ? "Bot" : "User"}
                              variant="outlined"
                            />
                            <Chip
                              size="small"
                              label={`Duration: ${formatDuration(action.duration)}`}
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      }
                    />
                    <Box>
                      <Chip
                        label={action.status}
                        color={
                          action.status === "success"
                            ? "success"
                            : action.status === "running"
                            ? "info"
                            : "error"
                        }
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </Box>
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};