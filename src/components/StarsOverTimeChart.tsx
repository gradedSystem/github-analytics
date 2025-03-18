import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Repo {
  id: number;
  name: string;
  stargazers_count: number;
}

interface StarsOverTimeChartProps {
  repos: Repo[];
}

export const StarsOverTimeChart = ({ repos }: StarsOverTimeChartProps) => {
  const [data, setData] = useState<any[]>([]);
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

  useEffect(() => {
    // Generate simulated data for each repo
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const simulatedData = months.map(month => {
      const point: any = { month };
      
      repos.forEach((repo, index) => {
        // Simulate a growth pattern based on current star count
        const monthIndex = months.indexOf(month);
        const growth = 1 - (0.15 * (months.length - monthIndex - 1));
        point[repo.name] = Math.round(repo.stargazers_count * growth);
      });
      
      return point;
    });
    
    setData(simulatedData);
  }, [repos]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        {repos.map((repo, index) => (
          <Line
            key={repo.id}
            type="monotone"
            dataKey={repo.name}
            stroke={COLORS[index % COLORS.length]}
            activeDot={{ r: 8 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};
