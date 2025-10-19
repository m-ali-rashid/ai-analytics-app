import React from 'react'
import { ParsedData } from '@/lib/excel-parser'

interface DataTableProps {
  data: ParsedData
  maxRows?: number
}

export function DataTable({ data, maxRows = 100 }: DataTableProps) {
  if (!data || !data.headers || data.rows.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        No data available
      </div>
    )
  }

  const displayRows = data.rows.slice(0, maxRows)
  const hasMoreRows = data.rows.length > maxRows

  return (
    <div className="w-full">
      <div className="mb-4 text-sm text-slate-400">
        Showing {displayRows.length} of {data.rows.length} rows
        {hasMoreRows && ` (limited to first ${maxRows} rows)`}
      </div>
      
      <div className="overflow-x-auto border border-slate-600 rounded-lg">
        <table className="min-w-full divide-y divide-slate-600">
          <thead className="bg-slate-700">
            <tr>
              {data.headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-teal-400 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-slate-600">
            {displayRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-slate-700">
                {data.headers.map((_, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-slate-200"
                  >
                    {row[colIndex] ?? ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}