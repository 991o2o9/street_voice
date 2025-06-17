import React from 'react';
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
} from 'recharts';
import { Report } from '../types';
import { calculateDistrictStats } from '../utils/dataProcessing';

interface AnalyticsChartsProps {
  reports: Report[];
}

export default function AnalyticsCharts({ reports }: AnalyticsChartsProps) {
  const districtStats = calculateDistrictStats(reports);

  // Prepare data for district chart
  const districtData = districtStats.map((stat) => ({
    district: stat.district,
    total: stat.totalReports,
    negative: stat.sentiments.negative || 0,
    positive: stat.sentiments.positive || 0,
    neutral: stat.sentiments.neutral || 0,
  }));

  // Prepare data for category pie chart
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* District Statistics */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          District Statistics
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={districtData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="district" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="negative"
              stackId="a"
              fill="#EF4444"
              name="Negative"
            />
            <Bar dataKey="neutral" stackId="a" fill="#6B7280" name="Neutral" />
            <Bar
              dataKey="positive"
              stackId="a"
              fill="#10B981"
              name="Positive"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Category Distribution
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
            >
              {categoryData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
