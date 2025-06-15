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
  private userAgent = 'VoiceOfStreet/1.0';

  // Поиск постов по ключевым словам
  async searchPosts(query: string, subreddit?: string, limit: number = 25): Promise<RedditPost[]> {
    try {
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

      const response = await fetch(`${searchUrl}?${params}`, {
        headers: {
          'User-Agent': this.userAgent
        }
      });

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }

      const data: RedditResponse = await response.json();
      return data.data.children.map(child => child.data);
    } catch (error) {
      console.error('Error fetching Reddit posts:', error);
      return [];
    }
  }

  // Получение постов из конкретного subreddit
  async getSubredditPosts(subreddit: string, sort: 'hot' | 'new' | 'top' = 'new', limit: number = 25): Promise<RedditPost[]> {
    try {
      const url = `${this.baseUrl}/r/${subreddit}/${sort}.json?limit=${limit}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent
        }
      });

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }

      const data: RedditResponse = await response.json();
      return data.data.children.map(child => child.data);
    } catch (error) {
      console.error('Error fetching subreddit posts:', error);
      return [];
    }
  }

  // Поиск российских жалоб и проблем
  async getRussianComplaints(): Promise<RedditPost[]> {
    const queries = [
      'проблема дороги',
      'жкх проблема',
      'плохой транспорт',
      'мусор двор',
      'отключили свет',
      'нет горячей воды',
      'ремонт дорог'
    ];

    const subreddits = ['russia', 'moscow', 'spb', 'pikabu'];
    
    const allPosts: RedditPost[] = [];

    // Поиск по ключевым словам в российских subreddit'ах
    for (const subreddit of subreddits) {
      for (const query of queries) {
        const posts = await this.searchPosts(query, subreddit, 10);
        allPosts.push(...posts);
        
        // Задержка между запросами
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Удаляем дубликаты
    const uniquePosts = allPosts.filter((post, index, self) => 
      index === self.findIndex(p => p.id === post.id)
    );

    return uniquePosts.slice(0, 50); // Ограничиваем до 50 постов
  }
}

export const redditService = new RedditService();
export type { RedditPost };