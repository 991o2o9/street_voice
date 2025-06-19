/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { Report, FilterState } from '../types';
import { calculateDistrictStats } from '../utils/dataProcessing';

interface AnalyticsChartsProps {
  reports: Report[];
  onFilterChange?: (filters: Partial<FilterState>) => void;
}

export default function AnalyticsCharts({
  reports,
  onFilterChange,
}: AnalyticsChartsProps) {
  const districtStats = calculateDistrictStats(reports);

  const districtData = districtStats.map((stat) => ({
    district: stat.district,
    total: stat.totalReports,
    negative: stat.sentiments.negative || 0,
    positive: stat.sentiments.positive || 0,
    neutral: stat.sentiments.neutral || 0,
  }));

  const categoryStats: Record<string, number> = {};
  reports.forEach((report) => {
    if (report.category) {
      categoryStats[report.category] =
        (categoryStats[report.category] || 0) + 1;
    }
  });

  const categoryData = Object.entries(categoryStats).map(([name, value]) => ({
    name,
    value,
  }));

  const timelineData = reports.reduce((acc: Record<string, number>, report) => {
    const date = new Date(report.timestamp).toLocaleDateString('en-US');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const timelineChartData = Object.entries(timelineData)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .slice(-14) // Last 14 days
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      reports: count,
    }));

  const severityData = reports
    .filter((r) => r.severity)
    .reduce((acc: Record<string, number>, report) => {
      const severityRange =
        report.severity! <= 3
          ? 'Low (1-3)'
          : report.severity! <= 6
          ? 'Medium (4-6)'
          : 'High (7-10)';
      acc[severityRange] = (acc[severityRange] || 0) + 1;
      return acc;
    }, {});

  const severityChartData = Object.entries(severityData).map(
    ([range, count]) => ({
      range,
      count,
    })
  );

  const COLORS = [
    '#3B82F6',
    '#EF4444',
    '#10B981',
    '#F59E0B',
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
    '#84CC16',
  ];

  const handleDistrictClick = (data: any) => {
    if (onFilterChange) {
      onFilterChange({ district: data.district });
    }
  };

  const handleCategoryClick = (data: any) => {
    if (onFilterChange) {
      onFilterChange({ category: data.name });
    }
  };

  const handleSeverityClick = (data: any) => {
    console.log('Severity clicked:', data);
  };

  const isDarkMode = document.documentElement.classList.contains('dark');

  const tooltipStyle = {
    backgroundColor: isDarkMode ? '#374151' : 'white',
    border: `1px solid ${isDarkMode ? '#4B5563' : '#e5e7eb'}`,
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    color: isDarkMode ? '#F9FAFB' : '#111827',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          District Statistics
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
            (Click to filter)
          </span>
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={districtData} onClick={handleDistrictClick}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDarkMode ? '#4B5563' : '#e5e7eb'}
            />
            <XAxis
              dataKey="district"
              tick={{ fontSize: 12, fill: isDarkMode ? '#D1D5DB' : '#374151' }}
              angle={-45}
              textAnchor="end"
              height={80}
              axisLine={{ stroke: isDarkMode ? '#6B7280' : '#9CA3AF' }}
              tickLine={{ stroke: isDarkMode ? '#6B7280' : '#9CA3AF' }}
            />
            <YAxis
              tick={{ fill: isDarkMode ? '#D1D5DB' : '#374151' }}
              axisLine={{ stroke: isDarkMode ? '#6B7280' : '#9CA3AF' }}
              tickLine={{ stroke: isDarkMode ? '#6B7280' : '#9CA3AF' }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
              contentStyle={tooltipStyle}
            />
            <Bar
              dataKey="negative"
              stackId="a"
              fill="#EF4444"
              name="Negative"
              cursor="pointer"
            />
            <Bar
              dataKey="neutral"
              stackId="a"
              fill="#6B7280"
              name="Neutral"
              cursor="pointer"
            />
            <Bar
              dataKey="positive"
              stackId="a"
              fill="#10B981"
              name="Positive"
              cursor="pointer"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Category Distribution
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
            (Click to filter)
          </span>
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              onClick={handleCategoryClick}
              cursor="pointer"
            >
              {categoryData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Reports Timeline (Last 14 Days)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={timelineChartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDarkMode ? '#4B5563' : '#e5e7eb'}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: isDarkMode ? '#D1D5DB' : '#374151' }}
              angle={-45}
              textAnchor="end"
              height={80}
              axisLine={{ stroke: isDarkMode ? '#6B7280' : '#9CA3AF' }}
              tickLine={{ stroke: isDarkMode ? '#6B7280' : '#9CA3AF' }}
            />
            <YAxis
              tick={{ fill: isDarkMode ? '#D1D5DB' : '#374151' }}
              axisLine={{ stroke: isDarkMode ? '#6B7280' : '#9CA3AF' }}
              tickLine={{ stroke: isDarkMode ? '#6B7280' : '#9CA3AF' }}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Area
              type="monotone"
              dataKey="reports"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Severity Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={severityChartData} onClick={handleSeverityClick}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDarkMode ? '#4B5563' : '#e5e7eb'}
            />
            <XAxis
              dataKey="range"
              tick={{ fontSize: 12, fill: isDarkMode ? '#D1D5DB' : '#374151' }}
              axisLine={{ stroke: isDarkMode ? '#6B7280' : '#9CA3AF' }}
              tickLine={{ stroke: isDarkMode ? '#6B7280' : '#9CA3AF' }}
            />
            <YAxis
              tick={{ fill: isDarkMode ? '#D1D5DB' : '#374151' }}
              axisLine={{ stroke: isDarkMode ? '#6B7280' : '#9CA3AF' }}
              tickLine={{ stroke: isDarkMode ? '#6B7280' : '#9CA3AF' }}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="count" fill="#8B5CF6" cursor="pointer" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
