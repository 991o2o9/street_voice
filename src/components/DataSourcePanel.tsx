import React, { useState } from 'react';
import { RefreshCw, Download, Globe, AlertCircle } from 'lucide-react';
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

  const loadRedditData = async () => {
    setIsLoading(true);
    try {
      console.log('Загружаем данные с Reddit...');
      
      // Получаем посты с Reddit
      const redditPosts = await redditService.getRussianComplaints();
      console.log(`Получено ${redditPosts.length} постов с Reddit`);
      
      // Конвертируем в формат Report
      const reports = processRedditPosts(redditPosts);
      console.log(`Обработано ${reports.length} релевантных сообщений`);
      
      if (reports.length > 0) {
        onDataLoaded(reports);
        setLoadedCount(reports.length);
        setLastUpdate(new Date());
      } else {
        console.warn('Не найдено релевантных сообщений');
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных с Reddit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-500 p-2 rounded-lg">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Источники данных</h3>
            <p className="text-sm text-gray-600">Загрузка реальных сообщений из социальных сетей</p>
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
              <span>Загружаю...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Загрузить с Reddit</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Статистика загрузки */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Download className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Загружено</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{loadedCount}</p>
          <p className="text-xs text-gray-500">сообщений</p>
        </div>

        {/* Последнее обновление */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <RefreshCw className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Обновлено</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {lastUpdate ? lastUpdate.toLocaleTimeString('ru-RU') : 'Никогда'}
          </p>
          <p className="text-xs text-gray-500">
            {lastUpdate ? lastUpdate.toLocaleDateString('ru-RU') : ''}
          </p>
        </div>

        {/* Источник */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Globe className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Источник</span>
          </div>
          <p className="text-sm font-semibold text-orange-600">Reddit API</p>
          <p className="text-xs text-gray-500">r/russia, r/moscow, r/spb</p>
        </div>
      </div>

      {/* Информация о данных */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Источники реальных данных:</p>
            <ul className="text-xs space-y-1 text-blue-700">
              <li>• Reddit - публичные посты о проблемах в российских городах</li>
              <li>• Автоматическая фильтрация по ключевым словам</li>
              <li>• Обновление данных в реальном времени</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}