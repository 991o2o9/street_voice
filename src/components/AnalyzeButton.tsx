import { Zap, Loader2 } from 'lucide-react';

interface AnalyzeButtonProps {
  onAnalyze: () => Promise<void>;
  isAnalyzing: boolean;
  analyzedCount: number;
  totalCount: number;
}

export default function AnalyzeButton({
  onAnalyze,
  isAnalyzing,
  analyzedCount,
  totalCount,
}: AnalyzeButtonProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Analysis</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Analyzed: {analyzedCount} of {totalCount} messages
          </p>
        </div>

        <button
          onClick={onAnalyze}
          disabled={isAnalyzing || analyzedCount === totalCount}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              <span>
                {analyzedCount === totalCount ? 'All Analyzed' : 'Analyze'}
              </span>
            </>
          )}
        </button>
      </div>

      {analyzedCount > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{Math.round((analyzedCount / totalCount) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(analyzedCount / totalCount) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}