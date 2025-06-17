import { AnalysisResult } from '../types';

class LocalTextAnalyzer {
  private categoryKeywords = {
    Housing: {
      keywords: [
        'apartment',
        'building',
        'rent',
        'landlord',
        'utilities',
        'heating',
        'plumbing',
        'maintenance',
        'home',
        'house',
        'electricity',
        'water',
        'gas',
        'leak',
        'flooding',
        'tenant',
        'rental',
        'hvac',
        'pipes',
      ],
      negativeIndicators: [
        'broken',
        'leaking',
        'cold',
        'dirty',
        'noisy',
        'expensive',
        'poor condition',
        'no heat',
        'no water',
        'mold',
        'pest',
        'cockroach',
        'rat',
        'overpriced',
        'unresponsive',
        'neglected',
        'damaged',
      ],
    },
    Roads: {
      keywords: [
        'road',
        'street',
        'pothole',
        'pavement',
        'sidewalk',
        'traffic',
        'intersection',
        'bridge',
        'construction',
        'lighting',
        'parking',
        'crosswalk',
        'lane',
        'highway',
        'asphalt',
        'concrete',
      ],
      negativeIndicators: [
        'broken road',
        'potholes',
        'poor surface',
        'no lighting',
        'dangerous',
        'accident',
        'traffic jam',
        'cracked',
        'flooded',
        'impassable',
        'blocked',
        'unsafe',
        'deteriorating',
        'damaged',
      ],
    },
    Transport: {
      keywords: [
        'bus',
        'train',
        'subway',
        'metro',
        'transport',
        'station',
        'schedule',
        'delay',
        'ticket',
        'fare',
        'driver',
        'route',
        'trolley',
        'tram',
      ],
      negativeIndicators: [
        'late',
        'delayed',
        'cancelled',
        'overcrowded',
        'rude driver',
        'expensive',
        'poor condition',
        'dirty',
        'unreliable',
        'broken down',
        'no service',
        'long wait',
        'uncomfortable',
      ],
    },
    Safety: {
      keywords: [
        'crime',
        'police',
        'security',
        'robbery',
        'theft',
        'violence',
        'emergency',
        'fire',
        'ambulance',
        'dangerous',
        'unsafe',
        'patrol',
        'incident',
        'vandalism',
        'break-in',
      ],
      negativeIndicators: [
        'mugged',
        'robbed',
        'stolen',
        'attacked',
        'threatened',
        'scared',
        'afraid',
        'dark area',
        'no security',
        'gang',
        'drug dealer',
        'assault',
        'harassment',
        'suspicious',
        'criminal activity',
      ],
    },
    Education: {
      keywords: [
        'school',
        'teacher',
        'student',
        'education',
        'class',
        'university',
        'college',
        'curriculum',
        'learning',
        'classroom',
        'principal',
      ],
      negativeIndicators: [
        'poor teaching',
        'overcrowded',
        'underfunded',
        'bullying',
        'bad teacher',
        'no resources',
        'outdated',
        'failing grades',
      ],
    },
    Healthcare: {
      keywords: [
        'hospital',
        'doctor',
        'medical',
        'health',
        'clinic',
        'medicine',
        'treatment',
        'emergency room',
        'nurse',
        'appointment',
      ],
      negativeIndicators: [
        'long wait',
        'expensive',
        'rude staff',
        'misdiagnosis',
        'poor service',
        'no appointment',
        'dirty facility',
        'understaffed',
      ],
    },
    Environment: {
      keywords: [
        'pollution',
        'waste',
        'garbage',
        'recycling',
        'park',
        'green',
        'air quality',
        'water quality',
        'noise',
        'litter',
        'trash',
      ],
      negativeIndicators: [
        'dirty',
        'smelly',
        'polluted',
        'toxic',
        'contaminated',
        'noisy',
        'overflowing trash',
        'no recycling',
        'air pollution',
        'water pollution',
      ],
    },
    'Urban Development': {
      keywords: [
        'construction',
        'development',
        'zoning',
        'planning',
        'infrastructure',
        'building permit',
        'city planning',
        'renovation',
        'demolition',
      ],
      negativeIndicators: [
        'poor planning',
        'no permits',
        'illegal construction',
        'overdevelopment',
        'noise pollution',
        'traffic problems',
        'blocked access',
      ],
    },
  };

  private severityWords = {
    critical: [
      'emergency',
      'urgent',
      'critical',
      'dangerous',
      'life-threatening',
      'severe',
    ],
    high: ['serious', 'major', 'significant', 'important', 'broken', 'failed'],
    medium: [
      'concerning',
      'problematic',
      'issue',
      'problem',
      'needs attention',
    ],
    low: ['minor', 'small', 'slight', 'little', 'improvement needed'],
  };

  private negativeIntensifiers = [
    'extremely',
    'very',
    'completely',
    'totally',
    'absolutely',
    'terrible',
    'awful',
    'horrible',
    'worst',
    'never',
    'always broken',
    'constantly',
    'repeatedly',
    'continuously',
    'every time',
    'all the time',
  ];

  analyzeCategory(text: string): string {
    const lowerText = text.toLowerCase();
    let maxScore = 0;
    let bestCategory = 'Other';

    for (const [category, data] of Object.entries(this.categoryKeywords)) {
      let score = 0;

      // Score for category keywords
      data.keywords.forEach((keyword) => {
        if (lowerText.includes(keyword)) {
          score += 1;
        }
      });

      // Bonus points for negative indicators (problems are more specific)
      data.negativeIndicators.forEach((indicator) => {
        if (lowerText.includes(indicator)) {
          score += 1.5;
        }
      });

      if (score > maxScore) {
        maxScore = score;
        bestCategory = category;
      }
    }

    return bestCategory;
  }

  analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const lowerText = text.toLowerCase();
    let negativeScore = 0;
    let positiveScore = 0;

    // Check for negative indicators across all categories
    Object.values(this.categoryKeywords).forEach((data) => {
      data.negativeIndicators.forEach((indicator) => {
        if (lowerText.includes(indicator)) {
          negativeScore += 2; // Weight negative indicators heavily
        }
      });
    });

    // Check for negative intensifiers
    this.negativeIntensifiers.forEach((intensifier) => {
      if (lowerText.includes(intensifier)) {
        negativeScore += 1;
      }
    });

    // Basic negative words
    const basicNegative = [
      'bad',
      'terrible',
      'awful',
      'horrible',
      'hate',
      'angry',
      'frustrated',
      'disappointed',
      'worst',
      'problem',
      'issue',
      'complaint',
      'not working',
      'broken',
      'failed',
    ];

    basicNegative.forEach((word) => {
      if (lowerText.includes(word)) {
        negativeScore += 1;
      }
    });

    // Basic positive words (fewer, as complaints are usually negative)
    const basicPositive = [
      'good',
      'great',
      'excellent',
      'amazing',
      'wonderful',
      'fantastic',
      'love',
      'happy',
      'satisfied',
      'pleased',
      'fixed',
    ];

    basicPositive.forEach((word) => {
      if (lowerText.includes(word)) {
        positiveScore += 1;
      }
    });

    if (negativeScore > positiveScore + 1) return 'negative'; // Bias toward negative for complaints
    if (positiveScore > negativeScore) return 'positive';
    return 'neutral';
  }

  analyzeSeverity(text: string): number {
    const lowerText = text.toLowerCase();
    let severity = 3; // Lower baseline

    // Check severity indicators
    this.severityWords.critical.forEach((word) => {
      if (lowerText.includes(word)) severity += 4;
    });

    this.severityWords.high.forEach((word) => {
      if (lowerText.includes(word)) severity += 3;
    });

    this.severityWords.medium.forEach((word) => {
      if (lowerText.includes(word)) severity += 2;
    });

    this.severityWords.low.forEach((word) => {
      if (lowerText.includes(word)) severity -= 1;
    });

    // Check for negative intensifiers
    this.negativeIntensifiers.forEach((intensifier) => {
      if (lowerText.includes(intensifier)) severity += 1;
    });

    return Math.max(1, Math.min(10, severity));
  }

  extractKeywords(text: string): string[] {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 2);

    const stopWords = new Set([
      'the',
      'and',
      'for',
      'are',
      'but',
      'not',
      'you',
      'all',
      'can',
      'had',
      'her',
      'was',
      'one',
      'our',
      'out',
      'day',
      'get',
      'has',
      'him',
      'his',
      'how',
      'its',
      'may',
      'new',
      'now',
      'old',
      'see',
      'two',
      'who',
      'boy',
      'did',
      'she',
      'use',
      'way',
      'say',
      'each',
      'which',
      'their',
      'time',
      'will',
      'about',
      'would',
      'there',
      'could',
      'other',
      'after',
      'first',
      'well',
      'many',
      'some',
      'work',
      'then',
      'where',
      'been',
      'come',
      'much',
      'more',
      'very',
      'what',
      'with',
      'have',
      'from',
      'they',
      'know',
      'want',
      'been',
      'good',
      'much',
      'some',
      'time',
      'very',
      'when',
      'come',
      'here',
      'just',
      'like',
      'long',
      'make',
      'many',
      'over',
      'such',
      'take',
      'than',
      'them',
      'well',
      'were',
    ]);

    const filteredWords = words.filter((word) => !stopWords.has(word));

    const wordCount: { [key: string]: number } = {};
    filteredWords.forEach((word) => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }
}

function analyzeLocally(text: string): AnalysisResult {
  const analyzer = new LocalTextAnalyzer();
  return {
    category: analyzer.analyzeCategory(text),
    sentiment: analyzer.analyzeSentiment(text),
    severity: analyzer.analyzeSeverity(text),
    keywords: analyzer.extractKeywords(text),
  };
}

export async function analyzeText(text: string): Promise<AnalysisResult> {
  return analyzeLocally(text);
}

export async function batchAnalyzeTexts(
  texts: string[]
): Promise<AnalysisResult[]> {
  return texts.map((text) => analyzeLocally(text));
}
