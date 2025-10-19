// Client-side Excel parser (browser only)
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

export async function parseExcelClient(file: File): Promise<ParsedData> {
  // This function is only for client-side use
  if (typeof window === 'undefined') {
    throw new Error('parseExcelClient can only be used in the browser')
  }
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // Get the first sheet
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        
        if (jsonData.length === 0) {
          reject(new Error('Empty spreadsheet'))
          return
        }
        
        const headers = jsonData[0] as string[]
        const rows = jsonData.slice(1) as any[][]
        
        const result: ParsedData = {
          headers,
          rows,
          sheetNames: workbook.SheetNames,
          metadata: {
            totalRows: rows.length,
            totalColumns: headers.length,
            fileName: file.name
          }
        }
        
        resolve(result)
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`))
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

// Server-side Excel parser
export async function parseExcelServer(file: File): Promise<ParsedData> {
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