"use client"

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from 'recharts';

// Data structure for each point in a series
interface TimePoint {
  time: string; // e.g., "Week 1"
  // Dynamic keys for each repo's commit count, e.g., "Repo A": 50
  [repoName: string]: number | string; 
}

// Props for the chart component
interface CommitActivityChartProps {
  data: TimePoint[];
  repoNames: string[]; 
}

// Helper to get CSS variable values
const getCssVariable = (variable: string) => `hsl(var(--${variable}))`;

// Use the same chart colors as defined in globals.css
const COLORS = [
  getCssVariable('chart-1'),
  getCssVariable('chart-2'),
  getCssVariable('chart-3'),
  getCssVariable('chart-4'),
  getCssVariable('chart-5'),
];

export const CommitActivityChart: React.FC<CommitActivityChartProps> = ({ data, repoNames }) => {
  if (!data || data.length === 0 || !repoNames || repoNames.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
        No data available for commit activity.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 5, 
          left: -25, 
          bottom: 5,
        }}
        barGap={4} 
        barCategoryGap="20%" // Or adjust as needed if using grouped bars explicitly
      >
        <CartesianGrid strokeDasharray="3 3" stroke={getCssVariable('border')} vertical={false} />
        <XAxis
          dataKey="time"
          stroke={getCssVariable('muted-foreground')}
          fontSize={10}
          tickLine={false}
          axisLine={{ stroke: getCssVariable('border') }}
        />
        <YAxis
          stroke={getCssVariable('muted-foreground')}
          fontSize={10}
          tickLine={false}
          axisLine={{ stroke: getCssVariable('border') }}
          allowDecimals={false}
          tickFormatter={(value) => typeof value === 'number' && value >= 1000 ? `${(value/1000).toFixed(0)}k` : value.toString()}
        />
        <Tooltip
          cursor={{ fill: getCssVariable('muted'), opacity: 0.3 }}
          contentStyle={{
            backgroundColor: getCssVariable('background'),
            borderColor: getCssVariable('border'),
            borderRadius: '0.5rem',
            color: getCssVariable('foreground'),
            fontSize: '12px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          }}
          labelStyle={{ fontWeight: 'bold', color: getCssVariable('foreground') }}
          itemStyle={{ color: getCssVariable('foreground') }}
        />
        <Legend
          wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
          iconSize={10}
          formatter={(value) => <span style={{ color: getCssVariable('foreground') }}>{value}</span>}
        />
        {repoNames.map((repoName, index) => (
          <Bar
            key={repoName}
            dataKey={repoName}
            fill={COLORS[index % COLORS.length]}
            radius={[3, 3, 0, 0]} // Rounded top corners for bars
            // If you want stacked bars, add stackId="a" to each Bar component
            // stackId="a" 
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};
