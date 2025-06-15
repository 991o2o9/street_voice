import { RedditPost } from '../services/redditService';
import { Report } from '../types';

// Маппинг российских городов и районов
const RUSSIAN_LOCATIONS = {
  'moscow': { city: 'Москва', districts: ['Центральный', 'Северный', 'Южный', 'Восточный', 'Западный'] },
  'spb': { city: 'Санкт-Петербург', districts: ['Центральный', 'Василеостровский', 'Петроградский', 'Адмиралтейский'] },
  'russia': { city: 'Россия', districts: ['Центральный', 'Северный', 'Южный', 'Приволжский', 'Сибирский'] },
  'pikabu': { city: 'Россия', districts: ['Москва', 'СПб', 'Регионы', 'Другие города'] }
};

// Координаты для российских городов
const CITY_COORDINATES: Record<string, [number, number]> = {
  'Москва': [55.7558, 37.6176],
  'Санкт-Петербург': [59.9311, 30.3609],
  'Россия': [55.7558, 37.6176], // По умолчанию Москва
};

// Генерация случайных координат в пределах города
function generateRandomCoordinates(baseCoords: [number, number]): [number, number] {
  const [lat, lng] = baseCoords;
  const latOffset = (Math.random() - 0.5) * 0.1; // ±0.05 градуса
  const lngOffset = (Math.random() - 0.5) * 0.1;
  return [lat + latOffset, lng + lngOffset];
}

// Определение района на основе содержимого поста
function extractDistrict(text: string, subreddit: string): string {
  const location = RUSSIAN_LOCATIONS[subreddit as keyof typeof RUSSIAN_LOCATIONS];
  if (!location) return 'Неизвестный';

  // Поиск упоминаний районов в тексте
  const mentionedDistrict = location.districts.find(district => 
    text.toLowerCase().includes(district.toLowerCase())
  );

  return mentionedDistrict || location.districts[Math.floor(Math.random() * location.districts.length)];
}

// Определение города на основе subreddit
function getCity(subreddit: string): string {
  const location = RUSSIAN_LOCATIONS[subreddit as keyof typeof RUSSIAN_LOCATIONS];
  return location?.city || 'Россия';
}

// Конвертация Reddit поста в Report
export function convertRedditPostToReport(post: RedditPost): Report {
  const city = getCity(post.subreddit);
  const district = extractDistrict(post.title + ' ' + post.selftext, post.subreddit);
  const baseCoords = CITY_COORDINATES[city] || CITY_COORDINATES['Россия'];
  
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

// Фильтрация релевантных постов
export function filterRelevantPosts(posts: RedditPost[]): RedditPost[] {
  const relevantKeywords = [
    'проблема', 'жалоба', 'плохо', 'ужасно', 'не работает', 'сломан',
    'грязно', 'мусор', 'дороги', 'жкх', 'транспорт', 'отключили',
    'ремонт', 'авария', 'затопило', 'холодно', 'горячая вода',
    'лифт', 'подъезд', 'двор', 'парковка', 'освещение'
  ];

  return posts.filter(post => {
    const text = (post.title + ' ' + post.selftext).toLowerCase();
    
    // Проверяем наличие релевантных ключевых слов
    const hasRelevantKeywords = relevantKeywords.some(keyword => 
      text.includes(keyword)
    );
    
    // Фильтруем по минимальной длине текста
    const hasMinLength = text.length > 20;
    
    // Исключаем посты с очень низким рейтингом
    const hasDecentScore = post.score > -5;
    
    return hasRelevantKeywords && hasMinLength && hasDecentScore;
  });
}

// Пакетная обработка Reddit постов
export function processRedditPosts(posts: RedditPost[]): Report[] {
  const relevantPosts = filterRelevantPosts(posts);
  return relevantPosts.map(convertRedditPostToReport);
}