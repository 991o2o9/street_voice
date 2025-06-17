import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FilterPanel from './components/FilterPanel';
import StatisticsCards from './components/StatisticsCards';
import AnalyticsCharts from './components/AnalyticsCharts';
import ReportsTable from './components/ReportsTable';
import ReportsMap from './components/ReportsMap';
import AnalyzeButton from './components/AnalyzeButton';
import DataSourcePanel from './components/DataSourcePanel';
import SolutionsPanel from './components/SolutionsPanel';
import DataPersistencePanel from './components/DataPersistencePanel';
import { Report, FilterState } from './types';
import { batchAnalyzeTexts } from './utils/openaiAnalysis';
import { filterReports } from './utils/dataProcessing';
import { LocalStorageService } from './utils/localStorage';

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
  const [activeTab, setActiveTab] = useState<'analytics' | 'solutions' | 'data'>('analytics');

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedReports = LocalStorageService.loadReports();
    if (storedReports.length > 0) {
      setReports(storedReports);
    }
  }, []);

  // Auto-save reports to localStorage whenever reports change
  useEffect(() => {
    if (reports.length > 0) {
      LocalStorageService.saveReports(reports);
    }
  }, [reports]);

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

  // Handle loading reports from storage or import
  const handleReportsLoaded = (loadedReports: Report[]) => {
    setReports(loadedReports);
  };

  // Handle clearing all data
  const handleClearData = () => {
    setReports([]);
    setFilters({
      category: 'all',
      sentiment: 'all',
      district: 'all',
      search: '',
    });
  };

  // Handle filter changes from charts
  const handleChartFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
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

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'solutions', label: 'AI Solutions', icon: '💡' },
    { id: 'data', label: 'Data Management', icon: '💾' },
  ];

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

          {/* Enhanced Statistics */}
          <StatisticsCards reports={filteredReports} />

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'analytics' && (
                <div className="space-y-8">
                  {/* Interactive Charts */}
                  <AnalyticsCharts 
                    reports={filteredReports} 
                    onFilterChange={handleChartFilterChange}
                  />

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
              )}

              {activeTab === 'solutions' && (
                <SolutionsPanel reports={filteredReports} />
              )}

              {activeTab === 'data' && (
                <DataPersistencePanel
                  reports={reports}
                  onReportsLoaded={handleReportsLoaded}
                  onClearData={handleClearData}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;