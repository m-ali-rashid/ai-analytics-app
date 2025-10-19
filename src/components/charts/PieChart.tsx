import React from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js'
import { Pie } from 'react-chartjs-2'
import { ChartData } from '@/types'

ChartJS.register(ArcElement, Tooltip, Legend, Title)

interface PieChartProps {
  data: ChartData
  title?: string
}

export function PieChart({ data, title }: PieChartProps) {
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
  }

  return (
    <div className="w-full h-96">
      <Pie data={data} options={options} />
    </div>
  )
}