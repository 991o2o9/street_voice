import { RedditPost } from '../services/redditService';
import { Report } from '../types';

// Популярные англоязычные локации с большим количеством данных
const GLOBAL_LOCATIONS = {
  'nyc': { city: 'New York', districts: ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'] },
  'newyorkcity': { city: 'New York', districts: ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'] },
  'losangeles': { city: 'Los Angeles', districts: ['Hollywood', 'Beverly Hills', 'Santa Monica', 'Downtown', 'Venice'] },
  'chicago': { city: 'Chicago', districts: ['Loop', 'North Side', 'South Side', 'West Side', 'Lincoln Park'] },
  'sanfrancisco': { city: 'San Francisco', districts: ['Mission', 'Castro', 'SOMA', 'Richmond', 'Sunset'] },
  'boston': { city: 'Boston', districts: ['Back Bay', 'North End', 'South End', 'Cambridge', 'Somerville'] },
  'london': { city: 'London', districts: ['Westminster', 'Camden', 'Hackney', 'Tower Hamlets', 'Kensington'] },
  'toronto': { city: 'Toronto', districts: ['Downtown', 'North York', 'Scarborough', 'Etobicoke', 'York'] },
  'melbourne': { city: 'Melbourne', districts: ['CBD', 'South Yarra', 'Richmond', 'St Kilda', 'Brunswick'] },
  'sydney': { city: 'Sydney', districts: ['CBD', 'Bondi', 'Manly', 'Parramatta', 'Newtown'] },
  'seattle': { city: 'Seattle', districts: ['Capitol Hill', 'Fremont', 'Ballard', 'Queen Anne', 'Georgetown'] },
  'philadelphia': { city: 'Philadelphia', districts: ['Center City', 'South Philly', 'Northern Liberties', 'Fishtown', 'University City'] }
};

// Координаты популярных городов
const CITY_COORDINATES: Record<string, [number, number]> = {
  'New York': [40.7128, -74.0060],
  'Los Angeles': [34.0522, -118.2437],
  'Chicago': [41.8781, -87.6298],
  'San Francisco': [37.7749, -122.4194],
  'Boston': [42.3601, -71.0589],
  'London': [51.5074, -0.1278],
  'Toronto': [43.6532, -79.3832],
  'Melbourne': [-37.8136, 144.9631],
  'Sydney': [-33.8688, 151.2093],
  'Seattle': [47.6062, -122.3321],
  'Philadelphia': [39.9526, -75.1652]
};

function generateRandomCoordinates(baseCoords: [number, number]): [number, number] {
  const [lat, lng] = baseCoords;
  const latOffset = (Math.random() - 0.5) * 0.1; 
  const lngOffset = (Math.random() - 0.5) * 0.1;
  return [lat + latOffset, lng + lngOffset];
}

// Определение района на основе содержимого поста
function extractDistrict(text: string, subreddit: string): string {
  const location = GLOBAL_LOCATIONS[subreddit as keyof typeof GLOBAL_LOCATIONS];
  if (!location) return 'Unknown';

  // Поиск упоминаний районов в тексте
  const mentionedDistrict = location.districts.find(district => 
    text.toLowerCase().includes(district.toLowerCase())
  );

  return mentionedDistrict || location.districts[Math.floor(Math.random() * location.districts.length)];
}

// Определение города на основе subreddit
function getCity(subreddit: string): string {
  const location = GLOBAL_LOCATIONS[subreddit as keyof typeof GLOBAL_LOCATIONS];
  return location?.city || 'Unknown';
}

// Конвертация Reddit поста в Report
export function convertRedditPostToReport(post: RedditPost): Report {
  const city = getCity(post.subreddit);
  const district = extractDistrict(post.title + ' ' + post.selftext, post.subreddit);
  const baseCoords = CITY_COORDINATES[city] || [40.7128, -74.0060]; // Default to NYC
  
  // Объединяем заголовок и текст поста
  const fullText = post.title + (post.selftext ? '. ' + post.selftext : '');
  
  return {
    id: `reddit_${post.id}`,
    text: fullText.slice(0, 500), // Ограничиваем длину
    location: `${city}, ${district}`,
    district: district,
    coordinates: generateRandomCoordinates(baseCoords),
    timestamp: new Date(post.created_utc * 1000).toISOString(),
    analyzed: false
  };
}

// Фильтрация релевантных постов для англоязычных локаций
export function filterRelevantPosts(posts: RedditPost[]): RedditPost[] {
  const relevantKeywords = [
    // Общие проблемы
    'problem', 'issue', 'complaint', 'broken', 'not working', 'terrible', 'awful',
    'dirty', 'trash', 'garbage', 'maintenance', 'repair', 'fix', 'flooding',
    
    // Транспорт
    'traffic', 'subway', 'bus', 'train', 'parking', 'road', 'construction',
    'delayed', 'cancelled', 'metro', 'transit',
    
    // Городские услуги
    'power outage', 'blackout', 'water', 'heat', 'heating', 'air conditioning',
    'elevator', 'lift', 'building', 'apartment', 'rent', 'landlord',
    
    // Безопасность и освещение
    'lighting', 'streetlight', 'safety', 'crime', 'noise', 'loud',
    
    // Инфраструктура
    'pothole', 'sidewalk', 'crosswalk', 'bridge', 'tunnel', 'wifi',
    'internet', 'cell service', 'phone service'
  ];

  return posts.filter(post => {
    const text = (post.title + ' ' + post.selftext).toLowerCase();
    
    // Проверяем наличие релевантных ключевых слов
    const hasRelevantKeywords = relevantKeywords.some(keyword => 
      text.includes(keyword.toLowerCase())
    );
    
    // Фильтруем по минимальной длине текста
    const hasMinLength = text.length > 20;
    
    // Исключаем посты с очень низким рейтингом
    const hasDecentScore = post.score > -5;
    
    // Исключаем посты только с картинками без текста
    const hasText = post.title.length > 5 || post.selftext.length > 0;
    
    return hasRelevantKeywords && hasMinLength && hasDecentScore && hasText;
  });
}

// Пакетная обработка Reddit постов
export function processRedditPosts(posts: RedditPost[]): Report[] {
  const relevantPosts = filterRelevantPosts(posts);
  return relevantPosts.map(convertRedditPostToReport);
}

// Дополнительная функция для определения приоритета постов
export function prioritizeReports(reports: Report[]): Report[] {
  return reports.sort((a, b) => {
    // Приоритизируем по времени (новые посты сначала)
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return timeB - timeA;
  });
}