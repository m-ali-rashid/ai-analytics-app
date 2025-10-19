# Copilot Instructions for AI Analytics App

## Project Overview
This is an AI-powered web application built with Next.js 14 that allows users to upload Excel files and automatically generate analytics, insights, and interactive charts. The app uses TypeScript, Tailwind CSS, and Chart.js for visualizations.

## Architecture & Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with react-chartjs-2
- **Excel Parsing**: XLSX library
- **Icons**: Lucide React

## Code Style & Conventions

### General Guidelines
- Use functional components with hooks (no class components)
- Prefer named exports over default exports for components
- Use TypeScript interfaces for all props and data structures
- Follow React best practices and hooks rules
- Use async/await instead of .then() for promises

### File Naming
- Components: PascalCase (e.g., `DataTable.tsx`)
- Utilities: camelCase (e.g., `excel-parser.ts`)
- API routes: lowercase with hyphens (e.g., `upload/route.ts`)
- Types: PascalCase interfaces (e.g., `ParsedData`)

### Import Organization
```typescript
// 1. React imports
import React, { useState, useEffect } from 'react'

// 2. Third-party libraries
import { Chart as ChartJS } from 'chart.js'

// 3. Internal components (absolute paths)
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/DataTable'

// 4. Types and utilities
import { ParsedData } from '@/lib/excel-parser'
import { cn } from '@/lib/utils'
```

### Component Structure
```typescript
interface ComponentProps {
  // Props interface first
}

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // 1. State hooks
  const [state, setState] = useState()
  
  // 2. Effect hooks
  useEffect(() => {}, [])
  
  // 3. Event handlers
  const handleClick = () => {}
  
  // 4. Render helpers
  const renderItem = () => {}
  
  // 5. Return JSX
  return (
    <div className="tailwind-classes">
      {/* JSX content */}
    </div>
  )
}
```

## Key Patterns & Best Practices

### Error Handling
- Always wrap API calls in try-catch blocks
- Provide user-friendly error messages
- Log errors to console for debugging
- Use loading states for async operations

```typescript
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

try {
  setLoading(true)
  setError(null)
  const result = await apiCall()
  // Handle success
} catch (err) {
  setError(err instanceof Error ? err.message : 'Something went wrong')
} finally {
  setLoading(false)
}
```

### API Route Structure
```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validation
    if (!data) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }
    
    // Process data
    const result = await processData(data)
    
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}
```

### Chart Component Pattern
```typescript
import { Chart as ChartJS, /* required elements */ } from 'chart.js'
import { ChartType } from 'react-chartjs-2'

ChartJS.register(/* required elements */)

interface ChartProps {
  data: ChartData
  title?: string
}

export function ChartComponent({ data, title }: ChartProps) {
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: !!title, text: title }
    }
  }

  return (
    <div className="w-full h-96">
      <ChartType data={data} options={options} />
    </div>
  )
}
```

## Data Flow & State Management

### Data Processing Pipeline
1. **Upload**: File → FormData → API route
2. **Parse**: Excel file → ParsedData interface
3. **Analyze**: ParsedData → Analytics + Insights
4. **Visualize**: Analytics → Chart data → Chart components

### State Structure
```typescript
// Main workspace state
const [data, setData] = useState<ParsedData | null>(null)
const [analytics, setAnalytics] = useState<AnalyticsResult | null>(null)
const [insights, setInsights] = useState<DataInsights | null>(null)
const [charts, setCharts] = useState<ChartConfig[]>([])
```

## File Structure & Responsibilities

### `/src/app/api/`
- **upload/route.ts**: Handle file uploads and Excel parsing
- **analytics/route.ts**: Generate data insights and statistics
- **charts/route.ts**: Create chart data from parsed Excel data

### `/src/components/`
- **Workspace.tsx**: Main container component, orchestrates data flow
- **FileUpload.tsx**: File upload UI and validation
- **DataTable.tsx**: Display parsed Excel data in table format
- **charts/**: Chart components (Bar, Line, Pie)
- **ui/**: Reusable UI components (Button, Card, Upload)

### `/src/lib/`
- **excel-parser.ts**: Excel file parsing logic
- **ai-service.ts**: Data analysis and insight generation
- **utils.ts**: Utility functions (className merging, formatting)

### `/src/types/`
- **index.ts**: TypeScript interfaces and types

## Common Tasks & Patterns

### Adding New Chart Types
1. Register Chart.js components
2. Create chart component following existing pattern
3. Add chart type to generateChart function
4. Update ChartData interface if needed

### Adding New Analytics
1. Extend DataInsights interface
2. Update analyzeData function in ai-service.ts
3. Add UI components to display new insights
4. Update recommendations logic

### File Upload Enhancements
1. Add validation in upload route
2. Update ParsedData interface for new data types
3. Enhance excel-parser.ts for new Excel features
4. Update UI feedback and error handling

## Testing Considerations
- Test with various Excel file formats (.xlsx, .xls)
- Validate with different data types (numbers, text, dates)
- Test error scenarios (invalid files, network errors)
- Ensure responsive design on different screen sizes

## Performance Guidelines
- Limit data table rows for large datasets (use pagination)
- Debounce chart generation for better UX
- Use React.memo for expensive chart renders
- Optimize bundle size by importing only needed Chart.js components

## Security Notes
- Validate file types on both client and server
- Sanitize Excel data before processing
- Limit file upload sizes
- Never execute user-provided code

## Accessibility
- Use semantic HTML elements
- Provide alt text for charts and images
- Ensure keyboard navigation works
- Use proper ARIA labels for interactive elements
- Maintain good color contrast ratios

## When Adding Features
1. Follow existing patterns and conventions
2. Add proper TypeScript types
3. Include error handling and loading states
4. Update relevant interfaces and types
5. Test with real Excel files
6. Consider mobile responsiveness
7. Add proper documentation comments