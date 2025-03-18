import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Repo {
  id: number;
  name: string;
  stargazers_count: number;
  forks_count: number;
}

interface TopReposChartProps {
  repos: Repo[];
}

export const TopReposChart = ({ repos }: TopReposChartProps) => {
  const data = repos.map(repo => ({
    name: repo.name,
    Stars: repo.stargazers_count,
    Forks: repo.forks_count
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 70
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={-45} 
          textAnchor="end"
          height={70}
          interval={0}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Stars" fill="#8884d8" />
        <Bar dataKey="Forks" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
};