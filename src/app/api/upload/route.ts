import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export interface ParsedData {
  headers: string[]
  rows: any[][]
  sheetNames: string[]
  metadata: {
    totalRows: number
    totalColumns: number
    fileName?: string
  }
}

async function parseExcelServer(file: File): Promise<ParsedData> {
  const arrayBuffer = await file.arrayBuffer()
  const data = new Uint8Array(arrayBuffer)
  const workbook = XLSX.read(data, { type: 'array' })
  
  // Get the first sheet
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  
  // Convert to JSON
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
  
  if (jsonData.length === 0) {
    throw new Error('Empty spreadsheet')
  }
  
  const headers = jsonData[0] as string[]
  const rows = jsonData.slice(1) as any[][]
  
  return {
    headers,
    rows,
    sheetNames: workbook.SheetNames,
    metadata: {
      totalRows: rows.length,
      totalColumns: headers.length,
      fileName: file.name
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }
    
    // Validate file type
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      return NextResponse.json({ error: 'Invalid file type. Please upload an Excel file.' }, { status: 400 })
    }
    
    const data = await parseExcelServer(file)
    
    return NextResponse.json({ 
      success: true,
      data,
      message: 'File uploaded and parsed successfully'
    })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error processing the file' 
    }, { status: 500 })
  }
}