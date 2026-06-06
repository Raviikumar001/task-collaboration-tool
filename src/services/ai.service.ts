import OpenAI from 'openai';
import { config } from '../config/env';

const client = new OpenAI({
  baseURL: 'https://api.cerebras.ai/v1',
  apiKey: config.CEREBRAS_API_KEY || '',
});

export async function generateTaskDescription(title: string): Promise<string> {
  if (!config.CEREBRAS_API_KEY) {
    throw new Error('Cerebras API key not configured');
  }

  const response = await client.chat.completions.create({
    model: 'gpt-oss-120b',
    messages: [
      {
        role: 'system',
        content: `You are a project management assistant. Given a task title, generate a concise, professional description that covers:
- What needs to be done
- Key deliverables or outcomes
- Suggested approach or steps

Keep it under 3-4 sentences. Output only the description, no preamble.`,
      },
      {
        role: 'user',
        content: title,
      },
    ],
    max_tokens: 300,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content?.trim() || '';
}
