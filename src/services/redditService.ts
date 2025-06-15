interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  created_utc: number;
  score: number;
  num_comments: number;
  subreddit: string;
  permalink: string;
  url: string;
}

interface RedditResponse {
  data: {
    children: Array<{
      data: RedditPost;
    }>;
    after: string | null;
  };
}



class RedditService {
  private baseUrl = 'https://www.reddit.com';
  private userAgent = 'CityReportsApp/1.0 (by /u/anonymous)';

  // Безопасные, популярные англоязычные subreddit'ы без карантина
  private safeSubreddits = [
    'nyc',
    'LosAngeles', 
    'chicago',
    'sanfrancisco',
    'boston',
    'unitedkingdom',
    'london',
    'toronto',
    'melbourne',
    'sydney',
    'seattle',
    'philadelphia',
    'mildlyinfuriating', // часто содержит городские проблемы
    'CrappyDesign', // инфраструктурные проблемы
    'UrbanPlanning',
    'transit',
    'PublicFreakout' // может содержать городские инциденты
  ];

  private async makeRequest(url: string): Promise<RedditResponse | null> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();

      // Проверяем на ошибки карантина или блокировки
      if (data.error || data.reason === 'quarantined' || data.reason === 'private') {
        console.warn(`Subreddit blocked or quarantined: ${data.message || data.reason}`);
        return null;
      }

      if (!response.ok) {
        console.error(`Reddit API error: ${response.status} - ${data.message || 'Unknown error'}`);
        return null;
      }

      return data as RedditResponse;
    } catch (error) {
      console.error('Error making Reddit request:', error);
      return null;
    }
  }

  // Поиск постов по ключевым словам
  async searchPosts(query: string, subreddit?: string, limit: number = 25): Promise<RedditPost[]> {
    const searchUrl = subreddit 
      ? `${this.baseUrl}/r/${subreddit}/search.json`
      : `${this.baseUrl}/search.json`;
    
    const params = new URLSearchParams({
      q: query,
      sort: 'new',
      limit: limit.toString(),
      restrict_sr: subreddit ? 'true' : 'false',
      t: 'week' // последняя неделя
    });

    const data = await this.makeRequest(`${searchUrl}?${params}`);
    return data ? data.data.children.map(child => child.data) : [];
  }

  // Получение постов из конкретного subreddit
  async getSubredditPosts(subreddit: string, sort: 'hot' | 'new' | 'top' = 'new', limit: number = 25): Promise<RedditPost[]> {
    const url = `${this.baseUrl}/r/${subreddit}/${sort}.json?limit=${limit}`;
    
    const data = await this.makeRequest(url);
    return data ? data.data.children.map(child => child.data) : [];
  }

  // Поиск городских проблем и жалоб на английском языке
  async getCityComplaints(): Promise<RedditPost[]> {
    const queries = [
      // Транспортные проблемы
      'traffic jam problem',
      'subway delay',
      'bus late problem',
      'parking nightmare',
      'road construction issue',
      
      // Коммунальные услуги
      'power outage',
      'water problem',
      'heating issue',
      'trash collection',
      'broken elevator',
      
      // Инфраструктура
      'pothole problem',
      'broken streetlight',
      'sidewalk repair',
      'noise complaint',
      'neighborhood issue',
      
      // Общие городские проблемы
      'city problem',
      'municipal issue',
      'local government',
      'urban planning fail'
    ];

    const allPosts: RedditPost[] = [];

    // Поиск по ключевым словам в безопасных subreddit'ах
    for (const subreddit of this.safeSubreddits) {
      console.log(`Searching in r/${subreddit}...`);
      
      try {
        // Сначала пробуем получить обычные посты из subreddit
        const regularPosts = await this.getSubredditPosts(subreddit, 'new', 15);
        allPosts.push(...regularPosts);

        // Затем ищем по конкретным запросам
        for (const query of queries.slice(0, 3)) { // Ограничиваем количество запросов
          const posts = await this.searchPosts(query, subreddit, 5);
          allPosts.push(...posts);
          
          // Задержка между запросами для избежания rate limit
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.warn(`Failed to fetch from r/${subreddit}:`, error);
        continue;
      }

      // Задержка между subreddit'ами
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Глобальный поиск по всему Reddit
    console.log('Performing global search...');
    for (const query of queries.slice(0, 5)) {
      const globalPosts = await this.searchPosts(query, undefined, 10);
      allPosts.push(...globalPosts);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Удаляем дубликаты и фильтруем
    const uniquePosts = allPosts.filter((post, index, self) => 
      index === self.findIndex(p => p.id === post.id)
    );

    // Фильтруем по релевантности и качеству
    const filteredPosts = uniquePosts.filter(post => {
      // Исключаем удаленные посты
      if (post.selftext === '[removed]' || post.selftext === '[deleted]') return false;
      
      // Минимальная длина заголовка
      if (post.title.length < 10) return false;
      
      // Исключаем посты с очень низким рейтингом
      if (post.score < -10) return false;
      
      return true;
    });

    console.log(`Found ${filteredPosts.length} unique posts`);
    return filteredPosts.slice(0, 100); // Ограничиваем до 100 постов
  }

  // Проверка доступности subreddit'а
  async checkSubredditAvailability(subreddit: string): Promise<boolean> {
    const url = `${this.baseUrl}/r/${subreddit}/about.json`;
    const data = await this.makeRequest(url);
    return data !== null;
  }

  // Получение списка доступных subreddit'ов
  async getAvailableSubreddits(): Promise<string[]> {
    const available: string[] = [];
    
    for (const subreddit of this.safeSubreddits) {
      const isAvailable = await this.checkSubredditAvailability(subreddit);
      if (isAvailable) {
        available.push(subreddit);
      }
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    return available;
  }
}

export const redditService = new RedditService();
export type { RedditPost };