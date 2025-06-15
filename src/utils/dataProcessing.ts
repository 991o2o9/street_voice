import { Report, DistrictStats } from '../types';

export function calculateDistrictStats(reports: Report[]): DistrictStats[] {
  const statsMap = new Map<string, DistrictStats>();

  reports.forEach(report => {
    if (!statsMap.has(report.district)) {
      statsMap.set(report.district, {
        district: report.district,
        totalReports: 0,
        categories: {},
        sentiments: {},
        coordinates: report.coordinates
      });
    }

    const stats = statsMap.get(report.district)!;
    stats.totalReports++;

    if (report.category) {
      stats.categories[report.category] = (stats.categories[report.category] || 0) + 1;
    }

    if (report.sentiment) {
      stats.sentiments[report.sentiment] = (stats.sentiments[report.sentiment] || 0) + 1;
    }
  });

  return Array.from(statsMap.values());
}

export function filterReports(reports: Report[], filters: { 
  category?: string; 
  sentiment?: string; 
  district?: string; 
  search?: string; 
}): Report[] {
  return reports.filter(report => {
    if (filters.category && filters.category !== 'all' && report.category !== filters.category) {
      return false;
    }
    
    if (filters.sentiment && filters.sentiment !== 'all' && report.sentiment !== filters.sentiment) {
      return false;
    }
    
    if (filters.district && filters.district !== 'all' && report.district !== filters.district) {
      return false;
    }
    
    if (filters.search && !report.text.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    return true;
  });
}

export function getSentimentColor(sentiment: string): string {
  switch (sentiment) {
    case 'positive': return '#059669';
    case 'negative': return '#DC2626';
    case 'neutral': return '#6B7280';
    default: return '#6B7280';
  }
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'ЖКХ': '#EF4444',
    'Дороги': '#F97316',
    'Транспорт': '#EAB308',
    'Безопасность': '#DC2626',
    'Образование': '#3B82F6',
    'Здравоохранение': '#06B6D4',
    'Экология': '#10B981',
    'Благоустройство': '#8B5CF6',
    'Другое': '#6B7280'
  };
  return colors[category] || colors['Другое'];
}