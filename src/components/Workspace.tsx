"use client";

import React, { useState } from "react";
import { FileUpload } from "./FileUpload";
import { DataTable } from "./DataTable";
import { BarChart } from "./charts/BarChart";
import { LineChart } from "./charts/LineChart";
import { PieChart } from "./charts/PieChart";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { X } from "lucide-react";
import { ParsedData } from "@/lib/excel-parser";
import { AnalyticsResult, ChartData } from "@/types";
import { DataInsights, ChartExplanation, KPIMetrics } from "@/lib/ai-service";

interface ChartConfig {
  id: string;
  type: string;
  data: ChartData;
  title: string;
  explanation?: ChartExplanation;
}

export function Workspace() {
  const [data, setData] = useState<ParsedData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResult | null>(null);
  const [insights, setInsights] = useState<DataInsights | null>(null);
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingChart, setGeneratingChart] = useState<string | null>(null);

  const handleDataParsed = async (parsedData: ParsedData) => {
    setData(parsedData);
    setLoading(true);

    try {
      // Generate analytics
      const response = await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: parsedData }),
      });

      const result = await response.json();
      if (result.success) {
        setAnalytics(result.analytics);
        setInsights(result.insights);
      }
    } catch (error) {
      console.error("Error generating analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateChart = async (
    chartType: "bar" | "line" | "pie",
    xColumn: string,
    yColumn: string
  ) => {
    if (!data) return;

    setGeneratingChart(chartType);

    try {
      const response = await fetch("/api/charts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chartType, data, xColumn, yColumn }),
      });

      const result = await response.json();
      if (result.success) {
        const newChart: ChartConfig = {
          id: `chart-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 11)}`,
          type: chartType,
          data: result.chartData,
          title: `${yColumn} by ${xColumn}`,
          explanation: result.explanation,
        };
        // Add new chart at the beginning of the array
        setCharts((prev: ChartConfig[]) => [newChart, ...prev]);
      }
    } catch (error) {
      console.error("Error generating chart:", error);
    } finally {
      setGeneratingChart(null);
    }
  };

  const removeChart = (chartId: string) => {
    setCharts((prev: ChartConfig[]) =>
      prev.filter((chart: ChartConfig) => chart.id !== chartId)
    );
  };

  const renderChart = (chart: ChartConfig) => {
    switch (chart.type) {
      case "bar":
        return <BarChart data={chart.data} title={chart.title} />;
      case "line":
        return <LineChart data={chart.data} title={chart.title} />;
      case "pie":
        return <PieChart data={chart.data} title={chart.title} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">
          AI Analytics Workspace
        </h1>
        <p className="text-slate-400">
          Upload your Excel file to generate insights and visualizations
        </p>
      </div>

      {/* KPI Dashboard */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Average Sentiment KPI */}
          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">Average Sentiment</p>
                <p className="text-2xl font-bold text-slate-100">
                  {(insights.kpis.averageSentiment.value * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500">{insights.kpis.averageSentiment.label}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                insights.kpis.averageSentiment.trend === 'positive' 
                  ? 'bg-emerald-400' 
                  : insights.kpis.averageSentiment.trend === 'negative'
                  ? 'bg-red-400'
                  : 'bg-slate-400'
              }`}></div>
            </div>
          </Card>

          {/* Total Volume KPI */}
          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">Total Volume</p>
                <p className="text-2xl font-bold text-slate-100">
                  {insights.kpis.totalVolume.value.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">{insights.kpis.totalVolume.label}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                insights.kpis.totalVolume.trend === 'up' 
                  ? 'bg-teal-400' 
                  : insights.kpis.totalVolume.trend === 'down'
                  ? 'bg-red-400'
                  : 'bg-slate-400'
              }`}></div>
            </div>
          </Card>

          {/* Top Gainer KPI */}
          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">Top Gainer</p>
                <p className="text-lg font-bold text-slate-100 truncate">
                  {insights.kpis.topGainer.name}
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-slate-300">
                    {insights.kpis.topGainer.value.toFixed(2)}
                  </p>
                  <p className="text-xs text-emerald-400">
                    +{insights.kpis.topGainer.change.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            </div>
          </Card>

          {/* Top Loser KPI */}
          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">Top Loser</p>
                <p className="text-lg font-bold text-slate-100 truncate">
                  {insights.kpis.topLoser.name}
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-slate-300">
                    {insights.kpis.topLoser.value.toFixed(2)}
                  </p>
                  <p className="text-xs text-red-400">
                    {insights.kpis.topLoser.change.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
            </div>
          </Card>
        </div>
      )}

      <FileUpload onDataParsed={handleDataParsed} />

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mx-auto"></div>
          <p className="mt-2 text-slate-400">Analyzing your data...</p>
        </div>
      )}

      {insights && (
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h2 className="text-xl font-semibold mb-4 text-slate-100">Data Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
              <p className="text-sm text-teal-400 font-medium">Total Rows</p>
              <p className="text-2xl font-bold text-slate-100">
                {insights.summary.totalRows}
              </p>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
              <p className="text-sm text-emerald-400 font-medium">
                Total Columns
              </p>
              <p className="text-2xl font-bold text-slate-100">
                {insights.summary.totalColumns}
              </p>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
              <p className="text-sm text-teal-400 font-medium">
                Numeric Columns
              </p>
              <p className="text-2xl font-bold text-slate-100">
                {insights.summary.numericColumns.length}
              </p>
            </div>
          </div>

          {insights.recommendations.length > 0 && (
            <div>
              <h3 className="font-medium mb-2 text-slate-100">AI Recommendations</h3>
              <ul className="space-y-1">
                {insights.recommendations.map((rec: string, index: number) => (
                  <li
                    key={index}
                    className="text-sm text-slate-300 flex items-start"
                  >
                    <span className="text-teal-400 mr-2">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {data && insights && (
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h2 className="text-xl font-semibold mb-4 text-slate-100">Generate Charts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.summary.numericColumns.length > 0 &&
              insights.summary.textColumns.length > 0 && (
                <Button
                  onClick={() =>
                    generateChart(
                      "bar",
                      insights.summary.textColumns[0],
                      insights.summary.numericColumns[0]
                    )
                  }
                  variant="outline"
                  disabled={generatingChart !== null}
                  className="relative bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600 hover:border-teal-400"
                >
                  {generatingChart === "bar" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-400"></div>
                    </div>
                  )}
                  <span
                    className={generatingChart === "bar" ? "opacity-0" : ""}
                  >
                    📊 Generate Bar Chart
                  </span>
                </Button>
              )}
            {insights.summary.numericColumns.length > 0 &&
              insights.summary.textColumns.length > 0 && (
                <Button
                  onClick={() =>
                    generateChart(
                      "line",
                      insights.summary.textColumns[0],
                      insights.summary.numericColumns[0]
                    )
                  }
                  variant="outline"
                  disabled={generatingChart !== null}
                  className="relative bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600 hover:border-teal-400"
                >
                  {generatingChart === "line" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-400"></div>
                    </div>
                  )}
                  <span
                    className={generatingChart === "line" ? "opacity-0" : ""}
                  >
                    📈 Generate Line Chart
                  </span>
                </Button>
              )}
            {insights.summary.numericColumns.length > 0 &&
              insights.summary.textColumns.length > 0 && (
                <Button
                  onClick={() =>
                    generateChart(
                      "pie",
                      insights.summary.textColumns[0],
                      insights.summary.numericColumns[0]
                    )
                  }
                  variant="outline"
                  disabled={generatingChart !== null}
                  className="relative bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600 hover:border-teal-400"
                >
                  {generatingChart === "pie" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-400"></div>
                    </div>
                  )}
                  <span
                    className={generatingChart === "pie" ? "opacity-0" : ""}
                  >
                    🥧 Generate Pie Chart
                  </span>
                </Button>
              )}
          </div>
        </Card>
      )}

      {charts.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-100">Generated Charts</h2>
            <p className="text-sm text-slate-400">
              {charts.length} chart{charts.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {charts.map((chart) => (
              <Card key={chart.id} className="relative p-6 group bg-slate-800 border-slate-700">
                {/* Close button */}
                <button
                  onClick={() => removeChart(chart.id)}
                  className="absolute top-4 right-4 z-10 p-1 rounded-full bg-slate-700 shadow-md border border-slate-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 hover:border-red-500"
                  title="Remove chart"
                >
                  <X className="h-4 w-4 text-slate-400 hover:text-white" />
                </button>

                {/* Chart content */}
                <div className="pr-8 space-y-4">
                  {renderChart(chart)}

                  {/* AI Explanation Section */}
                  {chart.explanation && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg border border-slate-600">
                      <div className="flex items-center mb-3">
                        <div className="w-2 h-2 bg-teal-400 rounded-full mr-2"></div>
                        <h4 className="font-semibold text-teal-400">
                          AI Insights
                        </h4>
                      </div>

                      {/* Key Findings */}
                      {chart.explanation.keyFindings.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-slate-200 mb-1">
                            Key Findings:
                          </h5>
                          <ul className="space-y-1">
                            {chart.explanation.keyFindings.map(
                              (finding: string, index: number) => (
                                <li
                                  key={index}
                                  className="text-sm text-slate-300 flex items-start"
                                >
                                  <span className="text-emerald-400 mr-2 mt-0.5">
                                    ✓
                                  </span>
                                  {finding}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Insights */}
                      {chart.explanation.insights.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-slate-200 mb-1">
                            Analysis:
                          </h5>
                          <ul className="space-y-1">
                            {chart.explanation.insights.map(
                              (insight: string, index: number) => (
                                <li
                                  key={index}
                                  className="text-sm text-slate-300 flex items-start"
                                >
                                  <span className="text-teal-400 mr-2 mt-0.5">
                                    •
                                  </span>
                                  {insight}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Recommendations */}
                      {chart.explanation.recommendations.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-slate-200 mb-1">
                            Recommendations:
                          </h5>
                          <ul className="space-y-1">
                            {chart.explanation.recommendations.map(
                              (rec: string, index: number) => (
                                <li
                                  key={index}
                                  className="text-sm text-slate-300 flex items-start"
                                >
                                  <span className="text-yellow-400 mr-2 mt-0.5">
                                    💡
                                  </span>
                                  {rec}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {data && (
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h2 className="text-xl font-semibold mb-4 text-slate-100">Data Preview</h2>
          <DataTable data={data} />
        </Card>
      )}
    </div>
  );
}
