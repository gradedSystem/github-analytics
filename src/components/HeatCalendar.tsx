// HeatCalendar.tsx - A Visx-based component for displaying commit activity
import React from 'react';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { scaleBand } from '@visx/scale';
import { HeatmapRect } from '@visx/heatmap';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { LegendLinear, LegendItem, LegendLabel } from '@visx/legend';
import { Box, Typography, useTheme } from '@mui/material';

// Define the dimensions of our visualization
const width = 600;
const height = 300;
const margin = { top: 10, left: 70, right: 20, bottom: 70 };

// Define types for our data structure
interface Bin {
  week: number;
  count: number;
}

interface CalendarDay {
  day: number;
  bins: Bin[];
}

// Accessors
const bins = (d: CalendarDay) => d.bins;
const count = (d: Bin) => d.count;



interface HeatCalendarProps {
  data: CalendarDay[];
}

export const HeatCalendar = ({ data }: HeatCalendarProps) => {
  const theme = useTheme();
  
  // Define color scale for the heatmap
  const colorScale = scaleLinear({
    domain: [0, Math.max(...data.flatMap(d => d.bins).map(count))],
    range: [theme.palette.primary.light, theme.palette.primary.dark],
  });

  // Dimensions for the heat map
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const yScale = scaleBand<number>({
    domain: [0, 1, 2, 3, 4, 5, 6],
    range: [0, yMax],
    padding: 0.1,
  });

  // Create a proper scale for the x-axis (weeks)
  const xScale = scaleBand<number>({
    domain: Array.from({ length: data[0].bins.length }, (_, i) => i),
    range: [0, xMax],
    padding: 0.1,
  });

  // Size of each cell
  const binWidth = xMax / data[0].bins.length;
  const binHeight = yMax / data.length;

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          <HeatmapRect
            data={data}
            xScale={(d) => d * binWidth}
            yScale={(d) => d * binHeight}
            colorScale={colorScale}
            binWidth={binWidth}
            binHeight={binHeight}
            bins={bins}
            count={count}
            gap={2}
          >
            {(heatmap) =>
              heatmap.map((heatmapBins) =>
                heatmapBins.map((bin) => (
                  <rect
                    key={`heatmap-rect-${bin.row}-${bin.column}`}
                    className="visx-heatmap-rect"
                    width={bin.width}
                    height={bin.height}
                    x={bin.x}
                    y={bin.y}
                    fill={bin.color}
                    fillOpacity={0.9}
                    rx={2}
                  />
                ))
              )
            }
          </HeatmapRect>
          
          {/* Y-axis (days of week) */}
          <AxisLeft
            scale={yScale}
            tickFormat={(d: number) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]}
            tickValues={[0, 1, 2, 3, 4, 5, 6]}
            hideAxisLine={true}
            hideTicks={true}
            tickLabelProps={() => ({
              fill: theme.palette.text.primary,
              fontSize: 12,
              textAnchor: 'end',
              dy: '0.33em',
              dx: -10,
            })}
          />
          
          {/* X-axis (weeks) */}
          <AxisBottom
            top={yMax}
            scale={xScale}
            tickFormat={(d) => `W${d + 1}`}
            tickValues={Array.from({ length: data[0].bins.length }, (_, i) => i)}
            hideAxisLine={true}
            hideTicks={true}
            tickLabelProps={() => ({
              fill: theme.palette.text.primary,
              fontSize: 12,
              textAnchor: 'middle',
              dy: '0.33em',
              dx: 0,
            })}
          />
        </Group>
      </svg>
      
      {/* Legend */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: 0, 
        left: margin.left, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1 
      }}>
        <Typography variant="caption">Fewer</Typography>
        <LegendLinear scale={colorScale} steps={5}>
          {(labels) => (
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              {labels.map((label, i) => (
                <LegendItem key={`legend-linear-${i}`} margin="0 5px">
                  <svg width={15} height={15}>
                    <rect fill={label.value} width={15} height={15} rx={2} />
                  </svg>
                </LegendItem>
              ))}
            </div>
          )}
        </LegendLinear>
        <Typography variant="caption">More</Typography>
      </Box>
    </Box>
  );
};

// Generate sample data for the heatmap visualization
export const generateCalendarData = (intensity = 1): CalendarDay[] => {
  // Create a 7x12 grid representing days and weeks
  const days = 7; // days of the week
  const weeks = 12; // number of weeks to show

  return Array.from({ length: days }).map((_, day): CalendarDay => {
    return {
      day,
      bins: Array.from({ length: weeks }).map((_, week): Bin => {
        // Create somewhat realistic patterns - more commits on weekdays
        const isWeekend = day === 0 || day === 6;
        const baseCount = isWeekend ?
          Math.floor(Math.random() * 3) :
          Math.floor(Math.random() * 7) + 2;

        return {
          week,
          count: baseCount * intensity,
        };
      }),
    };
  });
};