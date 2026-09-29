import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import EChart from './EChart';
import type { SnailResult } from '../../types/dashboard';

interface SnailWinsBarChartProps {
  results: SnailResult[];
}

function SnailWinsBarChart({ results }: SnailWinsBarChartProps) {
  const option = useMemo<EChartsOption>(() => ({
    aria: { enabled: true },
    tooltip: { trigger: 'axis' },
    grid: { left: 8, right: 8, top: 16, bottom: 8, containLabel: true },
    xAxis: {
      type: 'category',
      data: results.map((snail) => snail.name),
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
    },
    series: [
      {
        name: 'Victorias',
        type: 'bar',
        data: results.map((snail) => snail.wins),
        itemStyle: { color: '#111827', borderRadius: [6, 6, 0, 0] },
      },
    ],
  }), [results]);

  return <EChart option={option} />;
}

export default SnailWinsBarChart;