import React, { useState } from 'react';
import { Calendar, MapPin, MessageSquare, Eye, X } from 'lucide-react';
import { Report } from '../types';
import { getSentimentColor, getCategoryColor } from '../utils/dataProcessing';

interface ReportsTableProps {
  reports: Report[];
}

interface MessageModalProps {
  report: Report;
  isOpen: boolean;
  onClose: () => void;
}

function MessageModal({ report, isOpen, onClose }: MessageModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Full Message</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                {report.text}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Location</label>
                <p className="text-gray-900 flex items-center mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {report.location}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">District</label>
                <p className="text-gray-900 mt-1">{report.district}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Category</label>
                <div className="mt-1">
                  {report.category ? (
                    <span
                      className="inline-flex px-2 py-1 text-xs font-medium rounded-full text-white"
                      style={{
                        backgroundColor: getCategoryColor(report.category),
                      }}
                    >
                      {report.category}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Not defined</span>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Sentiment</label>
                <div className="mt-1">
                  {report.sentiment ? (
                    <span
                      className="inline-flex px-2 py-1 text-xs font-medium rounded-full text-white"
                      style={{
                        backgroundColor: getSentimentColor(report.sentiment),
                      }}
                    >
                      {report.sentiment}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Not defined</span>
                  )}
                </div>
              </div>
              
              {report.severity && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Severity</label>
                  <div className="mt-1 flex items-center">
                    <div className="flex space-x-1">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < report.severity!
                              ? report.severity! > 7
                                ? 'bg-red-500'
                                : report.severity! > 4
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {report.severity}/10
                    </span>
                  </div>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-500">Date</label>
                <p className="text-gray-900 flex items-center mt-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(report.timestamp).toLocaleString('en-US')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportsTable({ reports }: ReportsTableProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSentimentLabel = (sentiment: string) => {
    const labels: Record<string, string> = {
      positive: 'Positive',
      negative: 'Negative',
      neutral: 'Neutral',
    };
    return labels[sentiment] || 'Undefined';
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Messages ({reports.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sentiment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  District
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr
                  key={report.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="max-w-md">
                      <p className="text-sm text-gray-900">
                        {truncateText(report.text, 120)}
                      </p>
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
                        style={{
                          backgroundColor: getCategoryColor(report.category),
                        }}
                      >
                        {report.category}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Not defined</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {report.sentiment ? (
                      <span
                        className="inline-flex px-2 py-1 text-xs font-medium rounded-full text-white"
                        style={{
                          backgroundColor: getSentimentColor(report.sentiment),
                        }}
                      >
                        {getSentimentLabel(report.sentiment)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Not defined</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">
                      {report.district}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(report.timestamp)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="text-blue-600 hover:text-blue-800 transition-colors flex items-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {reports.length === 0 && (
          <div className="px-6 py-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No messages found</p>
          </div>
        )}
      </div>

      <MessageModal
        report={selectedReport!}
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </>
  );
}