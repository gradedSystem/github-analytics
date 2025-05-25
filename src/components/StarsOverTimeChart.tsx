"use client"

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from 'recharts';

// Data structure for each point in a series
interface TimePoint {
  time: string; // e.g., "Jan '23"
  // Dynamic keys for each repo's star count, e.g., "Repo A": 100
  [repoName: string]: number | string; 
}

// Props for the chart component
interface StarsOverTimeChartProps {
  // Data is an array of TimePoint objects. Each object represents a point in time (e.g., a month)
  // and contains star counts for multiple repositories at that time.
  // Example: [{ time: "Jan", "Repo A": 100, "Repo B": 150 }, { time: "Feb", "Repo A": 120, "Repo B": 180 }]
  data: TimePoint[];
  // repoKeys is an array of strings, where each string is a repository name (a key in TimePoint objects)
  // that corresponds to a line series to be plotted.
  repoNames: string[]; 
}

// Helper to get CSS variable values (simplified for direct use)
const getCssVariable = (variable: string) => `hsl(var(--${variable}))`;

// Use the same chart colors as defined in globals.css
const COLORS = [
  getCssVariable('chart-1'),
  getCssVariable('chart-2'),
  getCssVariable('chart-3'),
  getCssVariable('chart-4'),
  getCssVariable('chart-5'),
];

export const StarsOverTimeChart: React.FC<StarsOverTimeChartProps> = ({ data, repoNames }) => {
  if (!data || data.length === 0 || !repoNames || repoNames.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
        No data available for stars over time.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 10, 
          left: -15, 
          bottom: 5,
        }}
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
          cursor={{ stroke: getCssVariable('border'), strokeDasharray: '3 3' }}
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
          <Line
            key={repoName}
            type="monotone"
            dataKey={repoName} // This should match the keys in your data objects, e.g., "Repo A"
            stroke={COLORS[index % COLORS.length]}
            strokeWidth={2}
            dot={{
              r: 3,
              strokeWidth: 1,
              fill: COLORS[index % COLORS.length],
            }}
            activeDot={{
              r: 5,
              strokeWidth: 2,
              fill: getCssVariable('background'),
              stroke: COLORS[index % COLORS.length],
            }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};
