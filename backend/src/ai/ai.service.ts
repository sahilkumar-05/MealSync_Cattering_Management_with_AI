import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiService {
  private readonly apiKey = process.env.GEMINI_API_KEY;
  private readonly baseUrl =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
constructor() {
  console.log('API KEY LOADED:', process.env.GEMINI_API_KEY ? 'YES' : 'NO — undefined hai');
}

  // Ye common function hai — sab AI features isi ko call karenge
  async callLLM(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}?key=${this.apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
        },
        { headers: { 'Content-Type': 'application/json' } },
      );

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Empty response from LLM');
      }
      return text;
    } catch (error) {
      console.error('LLM call failed:', error.message);
      throw new InternalServerErrorException('AI service unavailable');
    }
  }

  // JSON wala response chahiye ho to ye use karo
  async callLLMForJSON(prompt: string): Promise<any> {
    const jsonPrompt = `${prompt}\n\nRespond ONLY with valid JSON. No markdown, no backticks, no explanation text — just the raw JSON object.`;

    const rawText = await this.callLLM(jsonPrompt);

    try {
      const cleaned = rawText.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Failed to parse LLM JSON response:', rawText);
      throw new InternalServerErrorException('AI returned invalid format');
    }
  }
}