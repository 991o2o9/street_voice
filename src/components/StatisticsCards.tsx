import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Clock,
  MapPin,
  Zap,
} from 'lucide-react';
import { Report } from '../types';

interface StatisticsCardsProps {
  reports: Report[];
}

export default function StatisticsCards({ reports }: StatisticsCardsProps) {
  const totalReports = reports.length;
  const analyzedReports = reports.filter((r) => r.analyzed).length;
  const positiveReports = reports.filter(
    (r) => r.sentiment === 'positive'
  ).length;
  const negativeReports = reports.filter(
    (r) => r.sentiment === 'negative'
  ).length;

  const positivePercentage =
    totalReports > 0 ? (positiveReports / totalReports) * 100 : 0;
  const negativePercentage =
    totalReports > 0 ? (negativeReports / totalReports) * 100 : 0;

  const uniqueDistricts = new Set(reports.map((r) => r.district)).size;
  const averageSeverity =
    reports.filter((r) => r.severity).length > 0
      ? reports
          .filter((r) => r.severity)
          .reduce((sum, r) => sum + (r.severity || 0), 0) /
        reports.filter((r) => r.severity).length
      : 0;

  const recentReports = reports.filter((r) => {
    const reportDate = new Date(r.timestamp);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return reportDate > oneDayAgo;
  }).length;

  const criticalReports = reports.filter(
    (r) => r.severity && r.severity >= 8
  ).length;

  const cards = [
    {
      title: 'Total Reports',
      value: totalReports,
      icon: BarChart3,
      color: 'bg-blue-500',
      textColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      description: 'All collected reports',
    },
    {
      title: 'Analyzed',
      value: analyzedReports,
      icon: Zap,
      color: 'bg-orange-500',
      textColor: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      description: `${analyzedReports}/${totalReports} processed`,
    },
    {
      title: 'Positive Sentiment',
      value: `${positivePercentage.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'bg-green-500',
      textColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      description: `${positiveReports} positive reports`,
    },
    {
      title: 'Negative Sentiment',
      value: `${negativePercentage.toFixed(1)}%`,
      icon: TrendingDown,
      color: 'bg-red-500',
      textColor: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      description: `${negativeReports} negative reports`,
    },
    {
      title: 'Districts Covered',
      value: uniqueDistricts,
      icon: MapPin,
      color: 'bg-purple-500',
      textColor: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      description: 'Unique locations',
    },
    {
      title: 'Avg. Severity',
      value: averageSeverity.toFixed(1),
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      description: 'Out of 10 scale',
    },
    {
      title: 'Last 24h',
      value: recentReports,
      icon: Clock,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      description: 'Recent activity',
    },
    {
      title: 'Critical Issues',
      value: criticalReports,
      icon: AlertTriangle,
      color: 'bg-red-600',
      textColor: 'text-red-700 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      description: 'Severity 8+ reports',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.bgColor} rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:scale-105`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {card.title}
              </p>
              <p className={`text-3xl font-bold ${card.textColor} mb-1`}>
                {card.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {card.description}
              </p>
            </div>
            <div className={`${card.color} p-3 rounded-lg shadow-sm`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
          </div>

          {card.title === 'Analyzed' && totalReports > 0 && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(analyzedReports / totalReports) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          )}

          {card.title === 'Avg. Severity' && averageSeverity > 0 && (
            <div className="mt-3 flex space-x-1">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < Math.round(averageSeverity)
                      ? averageSeverity > 7
                        ? 'bg-red-500'
                        : averageSeverity > 4
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
