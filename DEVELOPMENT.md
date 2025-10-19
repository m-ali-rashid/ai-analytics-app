# Development Guide - AI Analytics App

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
ai-analytics-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── upload/        # File upload endpoint
│   │   │   ├── analytics/     # Data analysis endpoint
│   │   │   └── charts/        # Chart generation endpoint
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── charts/           # Chart components
│   │   ├── ui/               # Reusable UI components
│   │   ├── DataTable.tsx     # Data display table
│   │   ├── FileUpload.tsx    # File upload component
│   │   └── Workspace.tsx     # Main workspace
│   ├── lib/                  # Utility libraries
│   │   ├── ai-service.ts     # Data analysis logic
│   │   ├── excel-parser.ts   # Excel file parsing
│   │   └── utils.ts          # Helper functions
│   └── types/                # TypeScript definitions
│       └── index.ts          # Type definitions
├── .github/
│   └── copilot-instructions.md  # Copilot guidelines
├── .vscode/
│   └── copilot-chat-participants.json  # Copilot participants
└── package.json
```

## Key Technologies

### Core Stack
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety and better DX
- **Tailwind CSS**: Utility-first CSS framework
- **React 18**: UI library with latest features

### Data & Visualization
- **XLSX**: Excel file parsing and manipulation
- **Chart.js**: Powerful charting library
- **react-chartjs-2**: React wrapper for Chart.js

### Development Tools
- **ESLint**: Code linting and formatting
- **Lucide React**: Modern icon library

## Development Workflow

### 1. Adding New Features

#### New Chart Type
```typescript
// 1. Create chart component
export function NewChart({ data, title }: ChartProps) {
  // Register Chart.js components
  ChartJS.register(/* required elements */)
  
  // Define options
  const options = { /* chart options */ }
  
  return <NewChartType data={data} options={options} />
}

// 2. Update chart generation service
export function generateChartData(
  data: ParsedData, 
  chartType: 'bar' | 'line' | 'pie' | 'new-type',
  xColumn: string, 
  yColumn: string
): ChartData {
  // Add new chart type logic
}

// 3. Update Workspace component
const renderChart = (chart) => {
  switch (chart.type) {
    case 'new-type':
      return <NewChart data={chart.data} title={chart.title} />
    // ... existing cases
  }
}
```

#### New Analytics Feature
```typescript
// 1. Extend types
interface DataInsights {
  // ... existing properties
  newInsight: NewInsightType
}

// 2. Update analysis logic
export function analyzeData(data: ParsedData): DataInsights {
  // ... existing analysis
  const newInsight = calculateNewInsight(data)
  
  return {
    // ... existing insights
    newInsight
  }
}

// 3. Update UI to display new insight
```

### 2. Testing Strategy

#### Manual Testing Checklist
- [ ] Upload various Excel file formats (.xlsx, .xls)
- [ ] Test with different data types (numbers, text, dates, mixed)
- [ ] Verify error handling (invalid files, network errors)
- [ ] Check responsive design on mobile/tablet
- [ ] Test chart generation with different column combinations
- [ ] Validate accessibility (keyboard navigation, screen readers)

#### Test Data Scenarios
- **Small dataset**: 10-50 rows, 3-5 columns
- **Medium dataset**: 100-500 rows, 5-10 columns  
- **Large dataset**: 1000+ rows, 10+ columns
- **Mixed data types**: Numbers, text, dates, empty cells
- **Edge cases**: Single row, single column, all empty

### 3. Performance Optimization

#### Data Handling
```typescript
// Limit displayed rows for large datasets
const MAX_DISPLAY_ROWS = 100

// Use pagination for large tables
const [currentPage, setCurrentPage] = useState(1)
const pageSize = 50

// Debounce chart generation
const debouncedGenerateChart = useMemo(
  () => debounce(generateChart, 300),
  []
)
```

#### Chart Optimization
```typescript
// Only register needed Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement, // Only import what you need
} from 'chart.js'

// Use React.memo for expensive chart renders
export const BarChart = React.memo(({ data, title }) => {
  // Chart component
})
```

### 4. Error Handling Patterns

#### API Routes
```typescript
export async function POST(request: NextRequest) {
  try {
    // Validate input
    const data = await request.json()
    if (!isValidData(data)) {
      return NextResponse.json(
        { error: 'Invalid input data' }, 
        { status: 400 }
      )
    }
    
    // Process data
    const result = await processData(data)
    
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('API Error:', error)
    
    // Return user-friendly error
    return NextResponse.json(
      { error: 'Processing failed. Please try again.' },
      { status: 500 }
    )
  }
}
```

#### Component Error Boundaries
```typescript
const [error, setError] = useState<string | null>(null)
const [loading, setLoading] = useState(false)

const handleAction = async () => {
  try {
    setLoading(true)
    setError(null)
    
    await performAction()
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Action failed')
  } finally {
    setLoading(false)
  }
}

// In JSX
{error && (
  <div className="bg-red-50 border border-red-200 rounded p-3">
    <p className="text-red-700 text-sm">{error}</p>
  </div>
)}
```

## Debugging Tips

### Common Issues

1. **Chart not rendering**
   - Check if Chart.js components are registered
   - Verify data format matches chart requirements
   - Ensure container has proper dimensions

2. **Excel parsing fails**
   - Validate file format and structure
   - Check for special characters in headers
   - Verify file isn't corrupted

3. **API route errors**
   - Check request/response format
   - Verify file upload size limits
   - Ensure proper error handling

### Debug Tools
```typescript
// Add debug logging
console.log('Data structure:', JSON.stringify(data, null, 2))

// Validate data types
console.log('Column types:', data.headers.map(h => typeof data.rows[0][h]))

// Check chart data format
console.log('Chart data:', chartData)
```

## Deployment

### Environment Variables
```bash
# Add to .env.local
NEXT_PUBLIC_MAX_FILE_SIZE=10485760  # 10MB
NEXT_PUBLIC_APP_NAME="AI Analytics App"
```

### Build Optimization
```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer

# Check for unused dependencies
npx depcheck
```

### Production Checklist
- [ ] Test with production build locally
- [ ] Verify all environment variables are set
- [ ] Check file upload size limits
- [ ] Test error scenarios in production
- [ ] Validate performance with large files
- [ ] Ensure proper error logging

## Contributing

1. **Code Style**: Follow existing patterns and ESLint rules
2. **Types**: Add proper TypeScript types for all new code
3. **Testing**: Test with various Excel file formats
4. **Documentation**: Update this guide for significant changes
5. **Performance**: Consider impact on large datasets

## Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Debugging
npm run build -- --debug    # Build with debug info
npm run dev -- --turbo      # Use Turbo mode (faster)

# Dependencies
npm audit                    # Check for vulnerabilities
npm outdated                 # Check for updates
npm run clean               # Clean build cache
```