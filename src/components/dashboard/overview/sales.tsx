'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import { alpha, useTheme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';
import { ArrowClockwise as ArrowClockwiseIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import type { ApexOptions } from 'apexcharts';

import { Chart } from '@/components/core/chart';

export function Sales({ sx }: { sx?: SxProps }): React.JSX.Element {
  const theme = useTheme();
  const [chartSeries, setChartSeries] = useState<{ name: string; data: number[] }[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const response = await fetch('http://192.168.1.224:5000/api/sessions/');
        const sessions = await response.json();

        const labels: string[] = [];
        const wastePercentages: number[] = [];

        sessions.forEach((session: any) => {
          const initialWeight = parseFloat(session.initialWeight);
          const numberOfStudents = parseInt(session.numberOfStudentsRegistered, 10);
          const totalExpectedWeight = initialWeight * numberOfStudents;
          const wasteWeight = parseFloat(session.wasteWeight);

          const wastePercentage = totalExpectedWeight > 0 
            ? (wasteWeight / totalExpectedWeight) * 100 
            : 0;

          const sessionLabel = new Date(session.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

          labels.push(sessionLabel);
          wastePercentages.push(parseFloat(wastePercentage.toFixed(2)));
        });

        setCategories(labels);
        setChartSeries([{ name: 'Gaspillage (%)', data: wastePercentages }]);
      } catch (error) {
        console.error('Failed to fetch sessions', error);
      }
    }

    fetchSessions();
  }, []);

  const chartOptions: ApexOptions = {
    chart: { background: 'transparent', stacked: false, toolbar: { show: false } },
    colors: [theme.palette.primary.main],
    dataLabels: { enabled: false },
    fill: { opacity: 1, type: 'solid' },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 2,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: { show: false },
    plotOptions: { bar: { columnWidth: '40px' } },
    stroke: { colors: ['transparent'], show: true, width: 2 },
    theme: { mode: theme.palette.mode },
    xaxis: {
      categories,
      axisBorder: { color: theme.palette.divider, show: true },
      axisTicks: { color: theme.palette.divider, show: true },
      labels: { offsetY: 5, style: { colors: theme.palette.text.secondary } },
    },
    yaxis: {
      labels: {
        formatter: (value) => `${value}%`,
        offsetX: -10,
        style: { colors: theme.palette.text.secondary },
      },
    },
  };

  return (
    <Card sx={sx}>
      <CardHeader
        action={
          <Button color="inherit" size="small" startIcon={<ArrowClockwiseIcon fontSize="var(--icon-fontSize-md)" />}>
            Sync
          </Button>
        }
        title="Statistiques des gaspillages"
      />
      <CardContent>
        <Chart height={350} options={chartOptions} series={chartSeries} type="bar" width="100%" />
      </CardContent>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button color="inherit" endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />} size="small">
          Aperçu
        </Button>
      </CardActions>
    </Card>
  );
}
