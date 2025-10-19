import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { ChartData } from '@/types'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface BarChartProps {
  data: ChartData
  title?: string
}

export function BarChart({ data, title }: BarChartProps) {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#CBD5E1', // slate-300
        },
      },
      title: {
        display: !!title,
        text: title,
        color: '#F1F5F9', // slate-100
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#94A3B8', // slate-400
        },
        grid: {
          color: '#475569', // slate-600
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#94A3B8', // slate-400
        },
        grid: {
          color: '#475569', // slate-600
        },
      },
    },
  }

  return (
    <div className="w-full h-96">
      <Bar data={data} options={options} />
    </div>
  )
}