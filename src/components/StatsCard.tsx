import { Paper, Box, Typography, Avatar } from "@mui/material";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  color: string;
}

export const StatsCard = ({ title, value, icon, color }: StatsCardProps) => {
  return (
    <Paper
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderTop: `4px solid ${color}`,
      }}
    >
      <Box display="flex" alignItems="center" mb={1}>
        <Avatar sx={{ bgcolor: color, width: 36, height: 36, mr: 1 }}>
          {icon}
        </Avatar>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography
        variant="h4"
        component="div"
        fontWeight="bold"
        sx={{ mt: 1 }}
      >
        {value.toLocaleString()}
      </Typography>
    </Paper>
  );
};