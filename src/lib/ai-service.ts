import { ParsedData } from './excel-parser'
import { AnalyticsResult, ChartData } from '../types'

export interface DataInsights {
  summary: {
    totalRows: number
    totalColumns: number
    numericColumns: string[]
    textColumns: string[]
    dateColumns: string[]
  }
  statistics: Record<string, {
    min?: number
    max?: number
    avg?: number
    sum?: number
    count: number
    uniqueValues?: number
  }>
  recommendations: string[]
  kpis: KPIMetrics
}

export interface KPIMetrics {
  averageSentiment: {
    value: number
    trend: 'positive' | 'negative' | 'neutral'
    label: string
  }
  totalVolume: {
    value: number
    trend: 'up' | 'down' | 'stable'
    label: string
  }
  topGainer: {
    name: string
    value: number
    change: number
    trend: 'positive'
  }
  topLoser: {
    name: string
    value: number
    change: number
    trend: 'negative'
  }
}

export interface ChartExplanation {
  title: string
  insights: string[]
  keyFindings: string[]
  recommendations: string[]
}

export async function generateAnalytics(data: ParsedData): Promise<AnalyticsResult> {
  const insights = analyzeData(data)
  
  return {
    summary: insights.summary,
    details: data.rows.map((row, index) => {
      const obj: Record<string, any> = { id: index + 1 }
      data.headers.forEach((header, i) => {
        obj[header] = row[i]
      })
      return obj
    })
  }
}

export function analyzeData(data: ParsedData): DataInsights {
  const { headers, rows } = data
  
  // Categorize columns by data type
  const numericColumns: string[] = []
  const textColumns: string[] = []
  const dateColumns: string[] = []
  
  const statistics: Record<string, any> = {}
  
  headers.forEach((header, colIndex) => {
    const columnData = rows.map(row => row[colIndex]).filter(val => val != null)
    
    if (columnData.length === 0) return
    
    // Check if column is numeric
    const numericValues = columnData.filter(val => !isNaN(Number(val)) && val !== '')
    const isNumeric = numericValues.length > columnData.length * 0.7
    
    if (isNumeric) {
      numericColumns.push(header)
      const numbers = numericValues.map(Number)
      statistics[header] = {
        min: Math.min(...numbers),
        max: Math.max(...numbers),
        avg: numbers.reduce((a, b) => a + b, 0) / numbers.length,
        sum: numbers.reduce((a, b) => a + b, 0),
        count: numbers.length
      }
    } else {
      // Check if it's a date column
      const dateValues = columnData.filter(val => !isNaN(Date.parse(val)))
      if (dateValues.length > columnData.length * 0.7) {
        dateColumns.push(header)
      } else {
        textColumns.push(header)
      }
      
      statistics[header] = {
        count: columnData.length,
        uniqueValues: new Set(columnData).size
      }
    }
  })
  
  // Generate recommendations
  const recommendations = generateRecommendations(numericColumns, textColumns, dateColumns)
  
  // Calculate KPIs
  const kpis = calculateKPIs(data, numericColumns, textColumns, statistics)
  
  return {
    summary: {
      totalRows: rows.length,
      totalColumns: headers.length,
      numericColumns,
      textColumns,
      dateColumns
    },
    statistics,
    recommendations,
    kpis
  }
}

function generateRecommendations(numeric: string[], text: string[], date: string[]): string[] {
  const recommendations: string[] = []
  
  if (numeric.length >= 2) {
    recommendations.push(`Create scatter plots to explore relationships between ${numeric.slice(0, 2).join(' and ')}`)
  }
  
  if (numeric.length >= 1 && text.length >= 1) {
    recommendations.push(`Generate bar charts showing ${numeric[0]} by ${text[0]}`)
  }
  
  if (date.length >= 1 && numeric.length >= 1) {
    recommendations.push(`Create time series charts showing ${numeric[0]} over ${date[0]}`)
  }
  
  if (text.length >= 1) {
    recommendations.push(`Analyze distribution of categories in ${text[0]}`)
  }
  
  return recommendations
}

function calculateKPIs(data: ParsedData, numericColumns: string[], textColumns: string[], statistics: Record<string, any>): KPIMetrics {
  const { headers, rows } = data
  
  // Find potential sentiment column (look for keywords like sentiment, score, rating, etc.)
  const sentimentColumn = headers.find(header => 
    /sentiment|score|rating|satisfaction|mood|emotion/i.test(header)
  )
  
  // Find potential volume column (look for keywords like volume, count, quantity, amount, etc.)
  const volumeColumn = headers.find(header => 
    /volume|count|quantity|amount|total|sum/i.test(header)
  ) || numericColumns[0] // fallback to first numeric column
  
  // Calculate Average Sentiment
  let averageSentiment = { value: 0, trend: 'neutral' as const, label: 'N/A' }
  if (sentimentColumn && numericColumns.includes(sentimentColumn)) {
    const sentimentStats = statistics[sentimentColumn]
    if (sentimentStats) {
      averageSentiment = {
        value: sentimentStats.avg || 0,
        trend: (sentimentStats.avg || 0) > 0.6 ? 'positive' : (sentimentStats.avg || 0) < 0.4 ? 'negative' : 'neutral',
        label: sentimentColumn
      }
    }
  } else if (numericColumns.length > 0) {
    // Use first numeric column as proxy sentiment
    const firstNumericStats = statistics[numericColumns[0]]
    const normalizedValue = firstNumericStats ? (firstNumericStats.avg || 0) / (firstNumericStats.max || 1) : 0
    averageSentiment = {
      value: normalizedValue,
      trend: normalizedValue > 0.6 ? 'positive' : normalizedValue < 0.4 ? 'negative' : 'neutral',
      label: numericColumns[0]
    }
  }
  
  // Calculate Total Volume
  let totalVolume = { value: 0, trend: 'stable' as const, label: 'Rows' }
  if (volumeColumn && statistics[volumeColumn]) {
    const volumeStats = statistics[volumeColumn]
    totalVolume = {
      value: volumeStats.sum || volumeStats.count || 0,
      trend: 'stable', // Would need historical data to determine trend
      label: volumeColumn
    }
  } else {
    totalVolume = {
      value: rows.length,
      trend: 'stable',
      label: 'Total Rows'
    }
  }
  
  // Find Top Gainer and Loser
  let topGainer = { name: 'N/A', value: 0, change: 0, trend: 'positive' as const }
  let topLoser = { name: 'N/A', value: 0, change: 0, trend: 'negative' as const }
  
  if (numericColumns.length > 0 && textColumns.length > 0) {
    const categoryColumn = textColumns[0]
    const valueColumn = numericColumns[0]
    
    const categoryIndex = headers.indexOf(categoryColumn)
    const valueIndex = headers.indexOf(valueColumn)
    
    if (categoryIndex !== -1 && valueIndex !== -1) {
      // Group by category and calculate averages
      const categoryData: Record<string, number[]> = {}
      
      rows.forEach(row => {
        const category = String(row[categoryIndex] || 'Unknown')
        const value = Number(row[valueIndex]) || 0
        
        if (!categoryData[category]) {
          categoryData[category] = []
        }
        categoryData[category].push(value)
      })
      
      // Calculate averages and find top/bottom performers
      const categoryAverages = Object.entries(categoryData).map(([category, values]) => ({
        name: category,
        value: values.reduce((sum, val) => sum + val, 0) / values.length,
        count: values.length
      })).filter(item => item.count > 0)
      
      if (categoryAverages.length > 0) {
        categoryAverages.sort((a, b) => b.value - a.value)
        
        const highest = categoryAverages[0]
        const lowest = categoryAverages[categoryAverages.length - 1]
        const average = categoryAverages.reduce((sum, item) => sum + item.value, 0) / categoryAverages.length
        
        topGainer = {
          name: highest.name,
          value: highest.value,
          change: ((highest.value - average) / average) * 100,
          trend: 'positive'
        }
        
        topLoser = {
          name: lowest.name,
          value: lowest.value,
          change: ((lowest.value - average) / average) * 100,
          trend: 'negative'
        }
      }
    }
  }
  
  return {
    averageSentiment,
    totalVolume,
    topGainer,
    topLoser
  }
}

export function generateChartData(data: ParsedData, chartType: 'bar' | 'line' | 'pie', xColumn: string, yColumn: string): ChartData {
  const xIndex = data.headers.indexOf(xColumn)
  const yIndex = data.headers.indexOf(yColumn)
  
  if (xIndex === -1 || yIndex === -1) {
    throw new Error('Invalid column selection')
  }
  
  const chartData: Record<string, number> = {}
  
  data.rows.forEach(row => {
    const xVal = String(row[xIndex] || 'Unknown')
    const yVal = Number(row[yIndex]) || 0
    
    if (chartData[xVal]) {
      chartData[xVal] += yVal
    } else {
      chartData[xVal] = yVal
    }
  })
  
  const labels = Object.keys(chartData)
  const values = Object.values(chartData)
  
  const colors = generateColors(labels.length)
  
  return {
    labels,
    datasets: [{
      label: yColumn,
      data: values,
      backgroundColor: chartType === 'pie' ? colors : [colors[0]],
      borderColor: chartType === 'line' ? [colors[0]] : undefined,
      borderWidth: chartType === 'line' ? 2 : 1
    }]
  }
}

function generateColors(count: number): string[] {
  const colors = [
    '#14B8A6', '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6',
    '#EC4899', '#F59E0B', '#EF4444', '#84CC16', '#6366F1'
  ]
  
  const result = []
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length])
  }
  
  return result
}

export function generateChartExplanation(
  chartType: 'bar' | 'line' | 'pie',
  xColumn: string,
  yColumn: string,
  chartData: ChartData,
  statistics: Record<string, any>
): ChartExplanation {
  const { labels, datasets } = chartData
  const values = datasets[0].data as number[]
  
  // Calculate basic statistics for the chart
  const total = values.reduce((sum, val) => sum + val, 0)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const avg = total / values.length
  
  // Find top performers
  const sortedData = labels.map((label, index) => ({
    label,
    value: values[index]
  })).sort((a, b) => b.value - a.value)
  
  const topPerformer = sortedData[0]
  const bottomPerformer = sortedData[sortedData.length - 1]
  
  const insights: string[] = []
  const keyFindings: string[] = []
  const recommendations: string[] = []
  
  // Generate chart-specific insights
  switch (chartType) {
    case 'bar':
      insights.push(`This bar chart shows the distribution of ${yColumn} across different ${xColumn} categories.`)
      insights.push(`The data contains ${labels.length} categories with a total sum of ${total.toLocaleString()}.`)
      
      keyFindings.push(`${topPerformer.label} has the highest value at ${topPerformer.value.toLocaleString()}.`)
      if (topPerformer.value > avg * 2) {
        keyFindings.push(`${topPerformer.label} significantly outperforms the average by ${((topPerformer.value / avg - 1) * 100).toFixed(1)}%.`)
      }
      
      if (bottomPerformer.value < avg * 0.5) {
        keyFindings.push(`${bottomPerformer.label} underperforms with only ${bottomPerformer.value.toLocaleString()}, well below average.`)
      }
      
      recommendations.push(`Focus on understanding why ${topPerformer.label} performs so well.`)
      recommendations.push(`Consider strategies to improve performance for lower-performing categories.`)
      break
      
    case 'line':
      insights.push(`This line chart tracks ${yColumn} trends across ${xColumn}.`)
      insights.push(`The trend shows variation from ${min.toLocaleString()} to ${max.toLocaleString()}.`)
      
      // Detect trend direction
      const firstHalf = values.slice(0, Math.floor(values.length / 2))
      const secondHalf = values.slice(Math.floor(values.length / 2))
      const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
      const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length
      
      if (secondAvg > firstAvg * 1.1) {
        keyFindings.push(`There's an upward trend with values increasing by ${((secondAvg / firstAvg - 1) * 100).toFixed(1)}%.`)
        recommendations.push(`The positive trend suggests continued growth potential.`)
      } else if (secondAvg < firstAvg * 0.9) {
        keyFindings.push(`There's a downward trend with values decreasing by ${((1 - secondAvg / firstAvg) * 100).toFixed(1)}%.`)
        recommendations.push(`Investigate factors causing the decline and implement corrective measures.`)
      } else {
        keyFindings.push(`The trend remains relatively stable with minor fluctuations.`)
        recommendations.push(`Monitor for any emerging patterns or seasonal effects.`)
      }
      break
      
    case 'pie':
      insights.push(`This pie chart shows the proportional breakdown of ${yColumn} by ${xColumn}.`)
      insights.push(`The largest segment represents ${((topPerformer.value / total) * 100).toFixed(1)}% of the total.`)
      
      const topThree = sortedData.slice(0, 3)
      const topThreePercent = (topThree.reduce((sum, item) => sum + item.value, 0) / total) * 100
      
      keyFindings.push(`The top 3 categories (${topThree.map(item => item.label).join(', ')}) account for ${topThreePercent.toFixed(1)}% of the total.`)
      
      if (topThreePercent > 80) {
        keyFindings.push(`High concentration: Top categories dominate the distribution.`)
        recommendations.push(`Consider focusing resources on these dominant categories.`)
      } else {
        keyFindings.push(`Balanced distribution across multiple categories.`)
        recommendations.push(`Maintain diversity while optimizing each segment.`)
      }
      break
  }
  
  // Add general recommendations
  if (max > avg * 3) {
    recommendations.push(`Investigate outliers that significantly exceed the average.`)
  }
  
  return {
    title: `AI Analysis: ${yColumn} by ${xColumn}`,
    insights,
    keyFindings,
    recommendations
  }
}