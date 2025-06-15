import OpenAI from 'openai';
import { AnalysisResult } from '../types';

const openai = new OpenAI({
  apiKey: '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',
  dangerouslyAllowBrowser: true
});

export async function analyzeText(text: string): Promise<AnalysisResult> {
  try {
    const prompt = `
Проанализируй следующий текст жалобы на русском языке и верни результат в формате JSON:

Текст: "${text}"

Определи:
1. category - одну из категорий: "ЖКХ", "Дороги", "Транспорт", "Безопасность", "Образование", "Здравоохранение", "Экология", "Благоустройство", "Другое"
2. sentiment - тональность: "positive", "negative", "neutral"
3. emotion - основную эмоцию: "anger", "frustration", "disappointment", "satisfaction", "joy", "concern", "neutral"
4. severity - серьезность проблемы от 1 до 10
5. keywords - массив ключевых слов (максимум 5)

Верни только JSON без дополнительного текста:
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 300
    });

    const result = response.choices[0]?.message?.content;
    if (!result) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(result.trim());
  } catch (error) {
    console.error('Error analyzing text:', error);
    // Fallback analysis
    return {
      category: 'Другое',
      sentiment: 'neutral',
      emotion: 'neutral',
      severity: 5,
      keywords: []
    };
  }
}

export async function batchAnalyzeTexts(texts: string[]): Promise<AnalysisResult[]> {
  const results: AnalysisResult[] = [];
  
  for (const text of texts) {
    try {
      const result = await analyzeText(text);
      results.push(result);
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Error in batch analysis:', error);
      results.push({
        category: 'Другое',
        sentiment: 'neutral',
        emotion: 'neutral',
        severity: 5,
        keywords: []
      });
    }
  }
  
  return results;
}