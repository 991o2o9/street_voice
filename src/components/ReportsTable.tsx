import React from 'react';
import { Calendar, MapPin, MessageSquare } from 'lucide-react';
import { Report } from '../types';
import { getSentimentColor, getCategoryColor } from '../utils/dataProcessing';

interface ReportsTableProps {
  reports: Report[];
}

export default function ReportsTable({ reports }: ReportsTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSentimentLabel = (sentiment: string) => {
    const labels: Record<string, string> = {
      positive: 'Позитивная',
      negative: 'Негативная',
      neutral: 'Нейтральная'
    };
    return labels[sentiment] || 'Неопределена';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" />
          <span>Сообщения ({reports.length})</span>
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Сообщение
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Категория
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Тональность
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Район
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дата
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="max-w-md">
                    <p className="text-sm text-gray-900 line-clamp-2">{report.text}</p>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      {report.location}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {report.category ? (
                    <span 
                      className="inline-flex px-2 py-1 text-xs font-medium rounded-full text-white"
                      style={{ backgroundColor: getCategoryColor(report.category) }}
                    >
                      {report.category}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Не определена</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {report.sentiment ? (
                    <span 
                      className="inline-flex px-2 py-1 text-xs font-medium rounded-full text-white"
                      style={{ backgroundColor: getSentimentColor(report.sentiment) }}
                    >
                      {getSentimentLabel(report.sentiment)}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Не определена</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-900">{report.district}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(report.timestamp)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {reports.length === 0 && (
        <div className="px-6 py-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Сообщения не найдены</p>
        </div>
      )}
    </div>
  );
}