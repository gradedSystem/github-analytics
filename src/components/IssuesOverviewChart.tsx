"use client"

import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';

interface ChartRepo {
  name: string;
  value: number; // 'value' is the default dataKey for Pie component in Recharts
}

interface IssuesOverviewChartProps {
  data: ChartRepo[]; // Expect pre-processed data
}

// Helper to get CSS variable values (simplified for direct use)
const getCssVariable = (variable: string) => `hsl(var(--${variable}))`;

const COLORS = [
  getCssVariable('chart-1'),
  getCssVariable('chart-2'),
  getCssVariable('chart-3'),
  getCssVariable('chart-4'),
  getCssVariable('chart-5'),
  getCssVariable('destructive'),
  getCssVariable('secondary'), // Fallback if more than 5/6 items
];

// Custom label for Pie chart slices (optional, can be complex for many small slices)
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6; // Place label inside slice
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent * 100 < 3) return null; // Don't render label for very small slices to avoid clutter

  return (
    <text x={x} y={y} fill={getCssVariable('primary-foreground')} textAnchor="middle" dominantBaseline="central" fontSize="10px" fontWeight="medium">
      {`${name} (${value})`}
    </text>
  );
};


export const IssuesOverviewChart: React.FC<IssuesOverviewChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
        No issue data to display.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Tooltip
          cursor={{ fill: getCssVariable('muted'), opacity: 0.3 }}
          contentStyle={{
            backgroundColor: getCssVariable('background'),
            borderColor: getCssVariable('border'),
            borderRadius: '0.5rem', // var(--radius)
            color: getCssVariable('foreground'),
            fontSize: '12px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          }}
          formatter={(value: number, name: string) => [`${value.toLocaleString()} issues`, name]}
          labelStyle={{ fontWeight: 'bold', color: getCssVariable('foreground') }}
          itemStyle={{ color: getCssVariable('foreground') }}
        />
        <Legend
          wrapperStyle={{ fontSize: '11px', paddingTop: '10px', lineHeight: '1.5' }}
          iconSize={10}
          layout="horizontal" 
          verticalAlign="bottom" 
          align="center"
          formatter={(value) => <span style={{ color: getCssVariable('foreground') }}>{value}</span>}
        />
        <Pie
          data={data}
          cx="50%"
          cy="45%" // Adjust vertical centering if legend takes space
          labelLine={false}
          // label={renderCustomizedLabel} // Using legend instead for clarity with many slices
          outerRadius={90} // Adjust as needed
          innerRadius={40} // Donut chart effect
          fill={getCssVariable('primary')} // Default fill, overridden by Cell
          dataKey="value"
          nameKey="name"
          stroke={getCssVariable('background')} // Use background color for stroke to create separation
          strokeWidth={2}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};
