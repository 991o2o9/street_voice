import React, { useState } from 'react';
import {
  Save,
  Download,
  Upload,
  Trash2,
  HardDrive,
  AlertCircle,
} from 'lucide-react';
import { LocalStorageService } from '../utils/localStorage';
import { Report } from '../types';

interface DataPersistencePanelProps {
  reports: Report[];
  onReportsLoaded: (reports: Report[]) => void;
  onClearData: () => void;
}

export default function DataPersistencePanel({
  reports,
  onReportsLoaded,
  onClearData,
}: DataPersistencePanelProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const storageInfo = LocalStorageService.getStorageInfo();
  const lastUpdate = LocalStorageService.getLastUpdate();
  const storageUsedMB = (storageInfo.used / (1024 * 1024)).toFixed(2);
  const storageUsedPercent = (
    (storageInfo.used / storageInfo.available) *
    100
  ).toFixed(1);

  const handleSaveToStorage = () => {
    LocalStorageService.saveReports(reports);
    window.location.reload();
  };

  const handleLoadFromStorage = () => {
    const storedReports = LocalStorageService.loadReports();
    if (storedReports.length > 0) {
      onReportsLoaded(storedReports);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const dataToExport = {
        reports,
        exportDate: new Date().toISOString(),
        version: '1.0',
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `street-voice-data-${
        new Date().toISOString().split('T')[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);

        if (importedData.reports && Array.isArray(importedData.reports)) {
          onReportsLoaded(importedData.reports);
          LocalStorageService.saveReports(importedData.reports);
        } else {
          throw new Error('Invalid file format');
        }
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Error importing data. Please check the file format.');
      } finally {
        setIsImporting(false);
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  const handleClearAllData = () => {
    if (
      window.confirm(
        'Are you sure you want to clear all data? This action cannot be undone.'
      )
    ) {
      LocalStorageService.clearAll();
      onClearData();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-purple-500 p-2 rounded-lg">
          <HardDrive className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Data Management
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Save, load, and manage your data
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-2 mb-2">
            <HardDrive className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Storage Used
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {storageUsedMB}MB
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {storageUsedPercent}% of available
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-2 mb-2">
            <Save className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Reports Stored
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {reports.length}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            in current session
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Last Saved
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Never'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {lastUpdate ? lastUpdate.toLocaleDateString() : 'No data saved'}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={handleSaveToStorage}
          disabled={reports.length === 0}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200"
        >
          <Save className="w-4 h-4" />
          <span>Save</span>
        </button>
        <button
          onClick={handleLoadFromStorage}
          className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200"
        >
          <Upload className="w-4 h-4" />
          <span>Load</span>
        </button>
        <button
          onClick={handleExportData}
          disabled={reports.length === 0 || isExporting}
          className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200"
        >
          {isExporting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>Export</span>
        </button>
        <label className="flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 cursor-pointer">
          {isImporting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          <span>Import</span>
          <input
            type="file"
            accept=".json"
            onChange={handleImportData}
            className="hidden"
            disabled={isImporting}
          />
        </label>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleClearAllData}
          className="flex items-center space-x-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors duration-200"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear All Data</span>
        </button>
      </div>
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">Data Persistence:</p>
            <ul className="text-xs space-y-1 text-blue-700 dark:text-blue-300">
              <li>• Data is saved locally in your browser</li>
              <li>• Export data to backup to your device</li>
              <li>• Import data to restore from backup</li>
              <li>• Clear data to free up storage space</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
