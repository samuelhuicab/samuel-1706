import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import EChart from './EChart';
import type { BetStats } from '../../types/dashboard';

interface BetsDonutChartProps {
  stats: BetStats;
}

function BetsDonutChart({ stats }: BetsDonutChartProps) {
  const option = useMemo<EChartsOption>(() => ({
    aria: { enabled: true },
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0 },
    color: ['#10b981', '#ef4444'],
    series: [
      {
        name: 'Apuestas',
        type: 'pie',
        radius: ['55%', '80%'],
        label: { show: false },
        data: [
          { name: 'Ganadas', value: stats.won },
          { name: 'Perdidas', value: stats.lost },
        ],
      },
    ],
  }), [stats]);

  return <EChart option={option} />;
}

export default BetsDonutChart;