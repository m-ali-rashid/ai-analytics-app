import { NextRequest, NextResponse } from 'next/server'
import { generateChartData, generateChartExplanation, analyzeData } from '@/lib/ai-service'

interface ParsedData {
  headers: string[]
  rows: any[][]
  sheetNames: string[]
  metadata: {
    totalRows: number
    totalColumns: number
    fileName?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const { chartType, data, xColumn, yColumn }: { 
      chartType: 'bar' | 'line' | 'pie'
      data: ParsedData
      xColumn: string
      yColumn: string
    } = await request.json()
    
    if (!chartType || !data || !xColumn || !yColumn) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }
    
    const chartData = generateChartData(data, chartType, xColumn, yColumn)
    
    // Generate AI explanation for the chart
    const insights = analyzeData(data)
    const explanation = generateChartExplanation(chartType, xColumn, yColumn, chartData, insights.statistics)
    
    return NextResponse.json({ 
      success: true,
      chartData,
      chartType,
      explanation
    })
    
  } catch (error) {
    console.error('Chart generation error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error generating chart data' 
    }, { status: 500 })
  }
}