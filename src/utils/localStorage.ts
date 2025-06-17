import { Report } from '../types';

const STORAGE_KEYS = {
  REPORTS: 'street_voice_reports',
  LAST_UPDATE: 'street_voice_last_update',
  SETTINGS: 'street_voice_settings',
};

export class LocalStorageService {
  // Save reports to localStorage
  static saveReports(reports: Report[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
      localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, new Date().toISOString());
    } catch (error) {
      console.error('Error saving reports to localStorage:', error);
    }
  }

  // Load reports from localStorage
  static loadReports(): Report[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REPORTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading reports from localStorage:', error);
    }
    return [];
  }

  // Get last update time
  static getLastUpdate(): Date | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LAST_UPDATE);
      if (stored) {
        return new Date(stored);
      }
    } catch (error) {
      console.error('Error loading last update from localStorage:', error);
    }
    return null;
  }

  // Clear all stored data
  static clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  // Get storage usage info
  static getStorageInfo(): { used: number; available: number } {
    try {
      const used = JSON.stringify(localStorage).length;
      const available = 5 * 1024 * 1024; // 5MB typical limit
      return { used, available };
    } catch (error) {
      return { used: 0, available: 0 };
    }
  }
}