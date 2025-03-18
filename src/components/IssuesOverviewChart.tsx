import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

interface Repo {
  id: number;
  name: string;
  open_issues_count: number;
}

interface IssuesOverviewChartProps {
  repos: Repo[];
}

export const IssuesOverviewChart = ({ repos }: IssuesOverviewChartProps) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const data = repos.map((repo, index) => ({
    name: repo.name,
    value: repo.open_issues_count
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [value, "Issues"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};
