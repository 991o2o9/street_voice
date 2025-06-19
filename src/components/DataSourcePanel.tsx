import { useState } from 'react';
import {
  RefreshCw,
  Download,
  Globe,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { redditService } from '../services/redditService';
import { processRedditPosts } from '../utils/redditDataProcessor';
import { Report } from '../types';

interface DataSourcePanelProps {
  onDataLoaded: (reports: Report[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function DataSourcePanel({
  onDataLoaded,
  isLoading,
  setIsLoading,
}: DataSourcePanelProps) {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [loadedCount, setLoadedCount] = useState(0);
  const [availableSubreddits, setAvailableSubreddits] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadRedditData = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      console.log('Loading data from Reddit...');

      console.log('Checking available subreddits...');
      const available = await redditService.getAvailableSubreddits();
      setAvailableSubreddits(available);
      console.log(`Available subreddits: ${available.join(', ')}`);

      const redditPosts = await redditService.getCityComplaints();
      console.log(`Fetched ${redditPosts.length} posts from Reddit`);

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
      setErrorMessage(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    if (errorMessage) return 'text-red-600 dark:text-red-400';
    if (loadedCount > 0) return 'text-green-600 dark:text-green-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getStatusIcon = () => {
    if (errorMessage)
      return <XCircle className="w-4 h-4 text-red-500 dark:text-red-400" />;
    if (loadedCount > 0)
      return (
        <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
      );
    return <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-500 p-2 rounded-lg">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Data Source
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {lastUpdate ? (
                <>Last update: {lastUpdate.toLocaleString()}</>
              ) : (
                'No data loaded yet'
              )}
            </p>
          </div>
        </div>

        <button
          onClick={loadRedditData}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              <span>Load Data</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-2 mb-2">
            <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Loaded
            </span>
          </div>
          <p className={`text-2xl font-bold ${getStatusColor()}`}>
            {loadedCount}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">reports</p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-2 mb-2">
            <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Updated
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {lastUpdate ? lastUpdate.toLocaleTimeString('en-US') : 'Never'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {lastUpdate ? lastUpdate.toLocaleDateString('en-US') : ''}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-2 mb-2">
            {getStatusIcon()}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </span>
          </div>
          <p className={`text-sm font-semibold ${getStatusColor()}`}>
            {errorMessage ? 'Error' : loadedCount > 0 ? 'Active' : 'Ready'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {availableSubreddits.length > 0
              ? `${availableSubreddits.length} sources`
              : 'Checking...'}
          </p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">Real data sources:</p>
            <ul className="text-xs space-y-1 text-blue-700 dark:text-blue-300">
              <li>
                • Reddit - public posts about city problems and complaints
              </li>
              <li>
                • Multiple city subreddits: NYC, LA, Chicago, SF, London, etc.
              </li>
              <li>• Automatic filtering by relevant keywords</li>
              <li>• Real-time data updates with error handling</li>
            </ul>
          </div>
        </div>
      </div>

      {availableSubreddits.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-800 dark:text-green-200">
              <p className="font-medium mb-1">Active sources:</p>
              <p className="text-xs text-green-700 dark:text-green-300">
                r/{availableSubreddits.slice(0, 8).join(', r/')}
                {availableSubreddits.length > 8 &&
                  ` and ${availableSubreddits.length - 8} more`}
              </p>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-start space-x-2">
            <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-800 dark:text-red-200">
              <p className="font-medium mb-1">Error loading data:</p>
              <p className="text-xs text-red-700 dark:text-red-300">
                {errorMessage}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
