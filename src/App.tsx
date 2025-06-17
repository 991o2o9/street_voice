import React, { useState } from 'react';
import Header from './components/Header';
import FilterPanel from './components/FilterPanel';
import StatisticsCards from './components/StatisticsCards';
import AnalyticsCharts from './components/AnalyticsCharts';
import ReportsTable from './components/ReportsTable';
import ReportsMap from './components/ReportsMap';
import AnalyzeButton from './components/AnalyzeButton';
import DataSourcePanel from './components/DataSourcePanel';
import { Report, FilterState } from './types';
import { batchAnalyzeTexts } from './utils/openaiAnalysis';
import { filterReports } from './utils/dataProcessing';

function App() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    sentiment: 'all',
    district: 'all',
    search: '',
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Get unique values for filters
  const districts = Array.from(new Set(reports.map((r) => r.district)));
  const categories = Array.from(
    new Set(reports.filter((r) => r.category).map((r) => r.category!))
  );

  // Filter reports based on current filters
  const filteredReports = filterReports(reports, filters);

  // Handle new data from Reddit
  const handleDataLoaded = (newReports: Report[]) => {
    setReports((prevReports) => {
      // Combine new data with existing data, avoiding duplicates
      const existingIds = new Set(prevReports.map((r) => r.id));
      const uniqueNewReports = newReports.filter((r) => !existingIds.has(r.id));

      return [...prevReports, ...uniqueNewReports];
    });
  };

  // Analyze reports function
  const analyzeReports = async () => {
    const unanalyzedReports = reports.filter((r) => !r.analyzed);
    if (unanalyzedReports.length === 0) return;

    setIsAnalyzing(true);
    try {
      const texts = unanalyzedReports.map((r) => r.text);
      const analysisResults = await batchAnalyzeTexts(texts);

      setReports((prevReports) =>
        prevReports.map((report) => {
          const index = unanalyzedReports.findIndex(
            (ur) => ur.id === report.id
          );
          if (index !== -1) {
            const analysis = analysisResults[index];
            return {
              ...report,
              category: analysis.category,
              sentiment: analysis.sentiment,
              emotion: analysis.emotion,
              severity: analysis.severity,
              analyzed: true,
            };
          }
          return report;
        })
      );
    } catch (error) {
      console.error('Error analyzing reports:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzedCount = reports.filter((r) => r.analyzed).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Data Source Panel */}
          <DataSourcePanel
            onDataLoaded={handleDataLoaded}
            isLoading={isLoadingData}
            setIsLoading={setIsLoadingData}
          />

          {/* Analyze Button */}
          <AnalyzeButton
            onAnalyze={analyzeReports}
            isAnalyzing={isAnalyzing}
            analyzedCount={analyzedCount}
            totalCount={reports.length}
          />

          {/* Statistics */}
          <StatisticsCards reports={filteredReports} />

          {/* Charts */}
          <AnalyticsCharts reports={filteredReports} />

          {/* Filters */}
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            districts={districts}
            categories={categories}
          />

          {/* Map and Table */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <ReportsMap reports={filteredReports} />
            <div className="xl:col-span-1">
              <ReportsTable reports={filteredReports} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
