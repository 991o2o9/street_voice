import React from 'react';
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
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

  const cards = [
    {
      title: 'Total Reports',
      value: totalReports,
      icon: BarChart3,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      title: 'Analyzed',
      value: analyzedReports,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
    },
    {
      title: 'Positive',
      value: `${positivePercentage.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      title: 'Negative',
      value: `${negativePercentage.toFixed(1)}%`,
      icon: TrendingDown,
      color: 'bg-red-500',
      textColor: 'text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className={`text-2xl font-bold ${card.textColor} mt-1`}>
                {card.value}
              </p>
            </div>
            <div className={`${card.color} p-3 rounded-lg`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
