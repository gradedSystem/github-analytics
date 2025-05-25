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

// Assuming a compatible Repo interface is available or passed
interface ChartRepo {
  name: string;
  stargazers_count: number;
  // Add other fields if needed by the chart, e.g., forks_count for a second bar
}

interface TopReposChartProps {
  data: ChartRepo[]; // Expect pre-processed data for the chart
}

// Helper to get CSS variable values (simplified for direct use)
const getCssVariable = (variable: string) => `hsl(var(--${variable}))`;

export const TopReposChart: React.FC<TopReposChartProps> = ({ data }) => {

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
        No data available for this chart.
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
          bottom: 40, 
        }}
        barGap={6}
        barCategoryGap="20%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke={getCssVariable('border')} vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={{ stroke: getCssVariable('border') }}
          angle={-30}
          textAnchor="end"
          height={50} 
          interval={0}
          stroke={getCssVariable('muted-foreground')}
          fontSize={10} // Smaller font size for axis labels
        />
        <YAxis
          tickLine={false}
          axisLine={{ stroke: getCssVariable('border') }}
          stroke={getCssVariable('muted-foreground')}
          fontSize={10} // Smaller font size for axis labels
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: getCssVariable('muted'), opacity: 0.3 }}
          contentStyle={{
            backgroundColor: getCssVariable('background'),
            borderColor: getCssVariable('border'),
            borderRadius: '0.5rem', // var(--radius)
            color: getCssVariable('foreground'),
            fontSize: '12px', // Standardized tooltip font size
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          }}
          labelStyle={{ fontWeight: 'bold', color: getCssVariable('foreground') }}
          itemStyle={{ color: getCssVariable('foreground') }}
        />
        <Legend
          wrapperStyle={{
            paddingTop: '20px',
            fontSize: '12px',
          }}
          formatter={(value) => <span style={{ color: getCssVariable('foreground') }}>{value}</span>}
        />
        <Bar
          dataKey="Stars" // Assuming data is processed to have a "Stars" key
          fill={getCssVariable('primary')}
          radius={[4, 4, 0, 0]}
          // activeBar={{ fill: getCssVariable('primary-foreground') }} // Example for active bar
        />
      </BarChart>
    </ResponsiveContainer>
  );
};