export interface UploadedFile {
  name: string;
  type: string;
  size: number;
}

export interface AnalyticsResult {
  summary: Record<string, any>;
  details: Array<Record<string, any>>;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
    borderWidth?: number;
  }>;
}