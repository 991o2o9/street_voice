import React, { useState } from 'react';
import { RefreshCw, Download, Globe, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { redditService } from '../services/redditService';
import { processRedditPosts } from '../utils/redditDataProcessor';
import { Report } from '../types';

interface DataSourcePanelProps {
  onDataLoaded: (reports: Report[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function DataSourcePanel({ onDataLoaded, isLoading, setIsLoading }: DataSourcePanelProps) {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [loadedCount, setLoadedCount] = useState(0);
  const [availableSubreddits, setAvailableSubreddits] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadRedditData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      console.log('Loading data from Reddit...');
      
      // Проверяем доступные subreddit'ы
      console.log('Checking available subreddits...');
      const available = await redditService.getAvailableSubreddits();
      setAvailableSubreddits(available);
      console.log(`Available subreddits: ${available.join(', ')}`);
      
      // Получаем посты с Reddit (изменено название метода)
      const redditPosts = await redditService.getCityComplaints();
      console.log(`Fetched ${redditPosts.length} posts from Reddit`);
      
      // Конвертируем в формат Report
      const reports = processRedditPosts(redditPosts);
      console.log(`Processed ${reports.length} relevant messages`);
      
      if (reports.length > 0) {
        onDataLoaded(reports);
        setLoadedCount(reports.length);
        setLastUpdate(new Date());
        setErrorMessage(null);
      } else {
        console.warn('No relevant messages found');
        setErrorMessage('No relevant city complaints found. Try again later.');
      }
    } catch (error) {
      console.error('Error loading data from Reddit:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    if (errorMessage) return 'text-red-600';
    if (loadedCount > 0) return 'text-green-600';
    return 'text-gray-600';
  };

  const getStatusIcon = () => {
    if (errorMessage) return <XCircle className="w-4 h-4 text-red-500" />;
    if (loadedCount > 0) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <Globe className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-500 p-2 rounded-lg">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Data Sources</h3>
            <p className="text-sm text-gray-600">Loading real messages from social media</p>
          </div>
        </div>
        
        <button
          onClick={loadRedditData}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Load from Reddit</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Статистика загрузки */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Download className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Loaded</span>
          </div>
          <p className={`text-2xl font-bold ${getStatusColor()}`}>{loadedCount}</p>
          <p className="text-xs text-gray-500">reports</p>
        </div>

        {/* Последнее обновление */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <RefreshCw className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Updated</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {lastUpdate ? lastUpdate.toLocaleTimeString('en-US') : 'Never'}
          </p>
          <p className="text-xs text-gray-500">
            {lastUpdate ? lastUpdate.toLocaleDateString('en-US') : ''}
          </p>
        </div>

        {/* Статус */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            {getStatusIcon()}
            <span className="text-sm font-medium text-gray-700">Status</span>
          </div>
          <p className={`text-sm font-semibold ${getStatusColor()}`}>
            {errorMessage ? 'Error' : loadedCount > 0 ? 'Active' : 'Ready'}
          </p>
          <p className="text-xs text-gray-500">
            {availableSubreddits.length > 0 ? `${availableSubreddits.length} sources` : 'Checking...'}
          </p>
        </div>
      </div>

      {/* Источники данных */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Real data sources:</p>
            <ul className="text-xs space-y-1 text-blue-700">
              <li>• Reddit - public posts about city problems and complaints</li>
              <li>• Multiple city subreddits: NYC, LA, Chicago, SF, London, etc.</li>
              <li>• Automatic filtering by relevant keywords</li>
              <li>• Real-time data updates with error handling</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Список доступных источников */}
      {availableSubreddits.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-800">
              <p className="font-medium mb-1">Active sources:</p>
              <p className="text-xs text-green-700">
                r/{availableSubreddits.slice(0, 8).join(', r/')}
                {availableSubreddits.length > 8 && ` and ${availableSubreddits.length - 8} more`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Сообщение об ошибке */}
      {errorMessage && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-start space-x-2">
            <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-1">Error loading data:</p>
              <p className="text-xs text-red-700">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}