import { config } from '../config';

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

interface RedditTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

class RedditService {
  private baseUrl = 'https://www.reddit.com';
  private oauthUrl = 'https://oauth.reddit.com';
  private userAgent = 'CityReportsApp/1.0 (by /u/anonymous)';
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  // Rate limiting
  private lastRequestTime: number = 0;
  private minRequestInterval: number = 3000; // 3 seconds between requests
  private rateLimitRetryDelay: number = 60000; // 1 minute retry delay for 429 errors
  private maxRetries: number = 3;

  // Safe, popular English-speaking subreddits without quarantine
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
    'mildlyinfuriating',
    'CrappyDesign',
    'UrbanPlanning',
    'transit',
    'PublicFreakout',
  ];

  private async rateLimitDelay(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minRequestInterval) {
      const delayTime = this.minRequestInterval - timeSinceLastRequest;
      console.log(`Rate limiting: waiting ${delayTime}ms before next request`);
      await new Promise((resolve) => setTimeout(resolve, delayTime));
    }

    this.lastRequestTime = Date.now();
  }

  private async getAccessToken(): Promise<string> {
    // If we have a valid token, return it
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      await this.rateLimitDelay();

      // Use a CORS proxy or handle this on your backend
      // For development, you might need to disable CORS or use a proxy
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      const targetUrl = 'https://www.reddit.com/api/v1/access_token';

      const response = await fetch(proxyUrl + targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${btoa(
            `${config.reddit.clientId}:${config.reddit.clientSecret}`
          )}`,
          'User-Agent': this.userAgent,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        throw new Error(
          `Failed to get access token: ${response.status} ${response.statusText}`
        );
      }

      const data = (await response.json()) as RedditTokenResponse;
      if (!data.access_token) {
        throw new Error('No access token in response');
      }

      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // Subtract 60 seconds for safety
      return this.accessToken;
    } catch (error) {
      console.error('Error getting access token:', error);
      // Fallback to public JSON endpoints
      console.log('Falling back to public Reddit JSON endpoints');
      throw error;
    }
  }

  private async makeAuthenticatedRequest(
    url: string,
    retryCount: number = 0
  ): Promise<RedditResponse | null> {
    try {
      await this.rateLimitDelay();

      const token = await this.getAccessToken();
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': this.userAgent,
        },
      });

      if (response.status === 429) {
        console.warn(
          `Rate limited (429). Retry ${retryCount + 1}/${this.maxRetries}`
        );

        if (retryCount < this.maxRetries) {
          const delay = this.rateLimitRetryDelay * Math.pow(2, retryCount); // Exponential backoff
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.makeAuthenticatedRequest(url, retryCount + 1);
        } else {
          console.error('Max retries reached for rate limiting');
          return null;
        }
      }

      if (!response.ok) {
        console.error(
          `HTTP error: ${response.status} - ${response.statusText}`
        );
        return null;
      }

      const data = await response.json();

      // Check for errors
      if (
        data.error ||
        data.reason === 'quarantined' ||
        data.reason === 'private'
      ) {
        console.warn(
          `Subreddit blocked or quarantined: ${data.message || data.reason}`
        );
        return null;
      }

      return data as RedditResponse;
    } catch (error) {
      console.error('Error making authenticated Reddit request:', error);
      return null;
    }
  }

  // Fallback method using public JSON endpoints (no authentication required)
  private async makePublicRequest(
    url: string,
    retryCount: number = 0
  ): Promise<RedditResponse | null> {
    try {
      await this.rateLimitDelay();

      // Add .json to the URL for public access
      const jsonUrl = url.includes('.json') ? url : `${url}.json`;

      const response = await fetch(jsonUrl, {
        method: 'GET',
        headers: {
          'User-Agent': this.userAgent,
        },
      });

      if (response.status === 429) {
        console.warn(
          `Rate limited (429). Retry ${retryCount + 1}/${this.maxRetries}`
        );

        if (retryCount < this.maxRetries) {
          const delay = this.rateLimitRetryDelay * Math.pow(2, retryCount); // Exponential backoff
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.makePublicRequest(url, retryCount + 1);
        } else {
          console.error('Max retries reached for rate limiting');
          return null;
        }
      }

      if (!response.ok) {
        console.error(
          `HTTP error: ${response.status} - ${response.statusText}`
        );
        return null;
      }

      const data = await response.json();

      // Check for errors
      if (
        data.error ||
        data.reason === 'quarantined' ||
        data.reason === 'private'
      ) {
        console.warn(
          `Subreddit blocked or quarantined: ${data.message || data.reason}`
        );
        return null;
      }

      return data as RedditResponse;
    } catch (error) {
      console.error('Error making public Reddit request:', error);
      return null;
    }
  }

  // Search posts by keywords (using public endpoints)
  async searchPosts(
    query: string,
    subreddit?: string,
    limit: number = 25
  ): Promise<RedditPost[]> {
    const searchUrl = subreddit
      ? `${this.baseUrl}/r/${subreddit}/search.json`
      : `${this.baseUrl}/search.json`;

    const params = new URLSearchParams({
      q: query,
      sort: 'new',
      limit: Math.min(limit, 25).toString(), // Reddit limits to 25 per request
      restrict_sr: subreddit ? 'true' : 'false',
      t: 'week',
    });

    const data = await this.makePublicRequest(`${searchUrl}?${params}`);
    return data ? data.data.children.map((child) => child.data) : [];
  }

  // Get posts from a specific subreddit (using public endpoints)
  async getSubredditPosts(
    subreddit: string,
    sort: 'hot' | 'new' | 'top' = 'new',
    limit: number = 25
  ): Promise<RedditPost[]> {
    const url = `${this.baseUrl}/r/${subreddit}/${sort}.json?limit=${Math.min(
      limit,
      25
    )}`;
    const data = await this.makePublicRequest(url);
    return data ? data.data.children.map((child) => child.data) : [];
  }

  // Search for city complaints and issues in English
  async getCityComplaints(): Promise<RedditPost[]> {
    const queries = [
      'traffic jam problem',
      'subway delay',
      'bus late problem',
      'parking nightmare',
      'road construction issue',
      'power outage',
      'water problem',
      'heating issue',
      'trash collection',
      'broken elevator',
      'pothole problem',
      'broken streetlight',
      'sidewalk repair',
      'noise complaint',
      'neighborhood issue',
      'city problem',
      'municipal issue',
      'local government',
      'urban planning fail',
    ];

    const allPosts: RedditPost[] = [];

    // Reduced number of subreddits and queries to avoid rate limiting
    for (const subreddit of this.safeSubreddits.slice(0, 3)) {
      // Reduced from 5 to 3
      console.log(`Searching in r/${subreddit}...`);

      try {
        // First try to get regular posts from subreddit
        const regularPosts = await this.getSubredditPosts(subreddit, 'new', 5); // Reduced from 10 to 5
        allPosts.push(...regularPosts);

        // Then search for specific queries (only 1 query per subreddit)
        const query = queries[0]; // Only use first query
        const posts = await this.searchPosts(query, subreddit, 3);
        allPosts.push(...posts);
      } catch (error) {
        console.warn(`Failed to fetch from r/${subreddit}:`, error);
        continue;
      }
    }

    // Very limited global search
    console.log('Performing limited global search...');
    try {
      const globalPosts = await this.searchPosts(queries[0], undefined, 5);
      allPosts.push(...globalPosts);
    } catch (error) {
      console.warn(`Failed global search:`, error);
    }

    // Remove duplicates and filter
    const uniquePosts = allPosts.filter(
      (post, index, self) => index === self.findIndex((p) => p.id === post.id)
    );

    // Filter by relevance and quality
    const filteredPosts = uniquePosts.filter((post) => {
      if (post.selftext === '[removed]' || post.selftext === '[deleted]')
        return false;
      if (post.title.length < 10) return false;
      if (post.score < -10) return false;
      return true;
    });

    console.log(`Found ${filteredPosts.length} unique posts`);
    return filteredPosts.slice(0, 30); // Reduced from 50 to 30
  }

  // Check subreddit availability (using public endpoints)
  async checkSubredditAvailability(subreddit: string): Promise<boolean> {
    try {
      await this.rateLimitDelay();

      const url = `${this.baseUrl}/r/${subreddit}/about.json`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': this.userAgent,
        },
      });

      if (response.status === 429) {
        console.warn(`Rate limited while checking r/${subreddit} availability`);
        return false; // Assume unavailable if rate limited
      }

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return !data.error && data.data && !data.data.quarantine;
    } catch (error) {
      console.warn(`Failed to check availability of r/${subreddit}:`, error);
      return false;
    }
  }

  // Get list of available subreddits
  async getAvailableSubreddits(): Promise<string[]> {
    const available: string[] = [];

    // Check even fewer subreddits for speed and to avoid rate limiting
    for (const subreddit of this.safeSubreddits.slice(0, 5)) {
      // Reduced from 8 to 5
      try {
        const isAvailable = await this.checkSubredditAvailability(subreddit);
        if (isAvailable) {
          available.push(subreddit);
        }
      } catch (error) {
        console.warn(`Failed to check availability of r/${subreddit}:`, error);
      }
    }

    return available;
  }

  // Alternative method for development/testing - generate mock data
  async getMockCityComplaints(): Promise<RedditPost[]> {
    console.log('Using mock data for development...');

    const mockPosts: RedditPost[] = [
      {
        id: 'mock1',
        title: 'Subway delays on Line 2 this morning - 20 minute wait',
        selftext:
          'Anyone else experiencing major delays on the subway? Been waiting for 20 minutes and no announcements.',
        author: 'commuter123',
        created_utc: Date.now() / 1000 - 3600,
        score: 45,
        num_comments: 12,
        subreddit: 'nyc',
        permalink: '/r/nyc/comments/mock1/subway_delays_on_line_2/',
        url: 'https://www.reddit.com/r/nyc/comments/mock1/subway_delays_on_line_2/',
      },
      {
        id: 'mock2',
        title: 'Huge pothole on Main Street - damaged my tire',
        selftext:
          'The pothole near the intersection of Main and 5th has gotten massive. Just damaged my tire going through it. City needs to fix this ASAP.',
        author: 'driver456',
        created_utc: Date.now() / 1000 - 7200,
        score: 78,
        num_comments: 23,
        subreddit: 'LosAngeles',
        permalink: '/r/LosAngeles/comments/mock2/huge_pothole_on_main_street/',
        url: 'https://www.reddit.com/r/LosAngeles/comments/mock2/huge_pothole_on_main_street/',
      },
      {
        id: 'mock3',
        title: 'Water main break on Oak Avenue - no water for 6 hours',
        selftext:
          'Water main broke early this morning on Oak Avenue. Whole block has been without water since 6 AM. City crews are on site but no ETA for repairs.',
        author: 'resident789',
        created_utc: Date.now() / 1000 - 21600,
        score: 156,
        num_comments: 45,
        subreddit: 'chicago',
        permalink: '/r/chicago/comments/mock3/water_main_break_on_oak_avenue/',
        url: 'https://www.reddit.com/r/chicago/comments/mock3/water_main_break_on_oak_avenue/',
      },
      {
        id: 'mock4',
        title: 'Parking meters broken downtown - getting tickets anyway',
        selftext:
          'Half the parking meters on 3rd Street are out of order but parking enforcement is still giving tickets. This is ridiculous.',
        author: 'downtown_parker',
        created_utc: Date.now() / 1000 - 14400,
        score: 92,
        num_comments: 31,
        subreddit: 'sanfrancisco',
        permalink: '/r/sanfrancisco/comments/mock4/parking_meters_broken/',
        url: 'https://www.reddit.com/r/sanfrancisco/comments/mock4/parking_meters_broken/',
      },
      {
        id: 'mock5',
        title: 'Construction noise starting at 5 AM every day',
        selftext:
          'The construction crew next to my building starts heavy machinery at 5 AM every morning. Is this even legal? How do I complain to the city?',
        author: 'sleepy_neighbor',
        created_utc: Date.now() / 1000 - 10800,
        score: 67,
        num_comments: 18,
        subreddit: 'boston',
        permalink: '/r/boston/comments/mock5/construction_noise_5am/',
        url: 'https://www.reddit.com/r/boston/comments/mock5/construction_noise_5am/',
      },
    ];

    return mockPosts;
  }

  // Method to reset rate limiting (useful during development)
  resetRateLimit(): void {
    this.lastRequestTime = 0;
    console.log('Rate limit reset');
  }

  // Method to check if we're currently rate limited
  isRateLimited(): boolean {
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    return timeSinceLastRequest < this.minRequestInterval;
  }
}

export const redditService = new RedditService();
export type { RedditPost };
