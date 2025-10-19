import { NextRequest, NextResponse } from 'next/server'
import { generateAnalytics, analyzeData } from '@/lib/ai-service'

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
    const { data }: { data: ParsedData } = await request.json()
    
    if (!data || !data.headers || !data.rows) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
    }
    
    const analytics = await generateAnalytics(data)
    const insights = analyzeData(data)
    
    return NextResponse.json({ 
      success: true,
      analytics,
      insights
    })
    
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error generating analytics' 
    }, { status: 500 })
  }
}