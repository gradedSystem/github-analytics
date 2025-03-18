import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Repo {
  id: number;
  name: string;
  commits_count: number;
}

interface CommitActivityChartProps {
  repos: Repo[];
}

export const CommitActivityChart = ({ repos }: CommitActivityChartProps) => {
  const [data, setData] = useState<any[]>([]);
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];
  const FILLS = ['#8884d8', '#82ca9d', '#ffc658'].map(color => `${color}66`);

  useEffect(() => {
    // Generate simulated weekly commit data
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const simulatedData = weeks.map(week => {
      const point: any = { week };
      
      repos.forEach((repo, index) => {
        // Simulate commits based on total count but with some randomness
        const weeklyCommits = Math.round(repo.commits_count / 12 * (0.7 + Math.random() * 0.6));
        point[repo.name] = weeklyCommits;
      });
      
      return point;
    });
    
    setData(simulatedData);
  }, [repos]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" />
        <YAxis />
        <Tooltip />
        <Legend />
        {repos.map((repo, index) => (
          <Area
            key={repo.id}
            type="monotone"
            dataKey={repo.name}
            stroke={COLORS[index % COLORS.length]}
            fill={FILLS[index % FILLS.length]}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};
