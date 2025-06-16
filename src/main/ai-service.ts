import OpenAI from 'openai';
import axios from 'axios';
import type { GenerationInput, OllamaModel } from '../shared/types';

interface AIResponse {
  title: string;
  content: string;
  questions: string;
  answers?: string;
  tags: string[];
}

export class AIService {
  private openaiClient: OpenAI | null = null;
  private ollamaEndpoint: string = 'http://localhost:11434';

  constructor() {
    // Clients will be initialized when needed
  }

  private initializeOpenAI(apiKey: string): void {
    this.openaiClient = new OpenAI({
      apiKey: apiKey,
    });
  }

  private buildPrompt(input: GenerationInput): string {
    const elementsToInclude = Object.entries(input.include_elements)
      .filter(([_, include]) => include)
      .map(([element, _]) => element.replace(/_/g, ' '))
      .join(', ');

    const lengthGuidance = {
      'Short': '500-800 words',
      'Medium': '800-1500 words',
      'Long': '1500+ words'
    }[input.length_preference];

    return `You are an expert educator specializing in creating engaging case studies for learning purposes.

Create a comprehensive case study with the following specifications:

DOMAIN: ${input.domain}
COMPLEXITY LEVEL: ${input.complexity}
SCENARIO TYPE: ${input.scenario_type}
CONTEXT: ${input.context_setting}
KEY CONCEPTS TO INCLUDE: ${input.key_concepts}
TARGET LENGTH: ${lengthGuidance}

REQUIRED ELEMENTS TO INCLUDE: ${elementsToInclude}

${input.custom_prompt ? `ADDITIONAL REQUIREMENTS: ${input.custom_prompt}` : ''}

Please structure your response as follows:

**TITLE**: [Compelling title for the case study]

**CASE STUDY**:
[Main case study content here - tell a realistic, engaging story that incorporates the specified context and key concepts. Make it authentic and relatable while ensuring it provides sufficient complexity for the target level.]

**ANALYSIS QUESTIONS**:
[Create 3-5 thought-provoking questions that encourage deep analysis and application of the key concepts. Questions should be open-ended and promote critical thinking.]

${input.include_elements.suggested_solutions ? '**MODEL ANSWERS**: [Provide thoughtful model answers to the analysis questions]' : ''}

**TAGS**: [Suggest 3-5 relevant tags for categorization]

Guidelines:
- Make the scenario realistic and engaging
- Ensure appropriate complexity for ${input.complexity} level learners
- Include diverse perspectives and stakeholders where relevant
- Focus on practical applications of theoretical concepts
- Encourage critical thinking and analysis
- Keep the tone professional but accessible`;
  }

  async generateCaseStudy(input: GenerationInput, provider: string = 'openai', model: string = 'gpt-4', apiKey?: string, endpoint?: string): Promise<AIResponse> {
    switch (provider.toLowerCase()) {
      case 'ollama':
        if (endpoint) {
          const originalEndpoint = this.ollamaEndpoint;
          this.ollamaEndpoint = endpoint;
          const result = await this.generateWithOllama(input, model);
          this.ollamaEndpoint = originalEndpoint;
          return result;
        } else {
          return this.generateWithOllama(input, model);
        }
      case 'openai':
      default:
        return this.generateWithOpenAI(input, model, apiKey);
    }
  }

  private async generateWithOpenAI(input: GenerationInput, model: string = 'gpt-4', apiKey?: string): Promise<AIResponse> {
    const key = apiKey || process.env.OPENAI_API_KEY;
    
    if (!key) {
      throw new Error('OpenAI API key not configured. Please add your API key in Settings.');
    }

    if (!this.openaiClient) {
      this.initializeOpenAI(key);
    }

    if (!this.openaiClient) {
      throw new Error('Failed to initialize OpenAI client');
    }

    try {
      const prompt = this.buildPrompt(input);
      
      const completion = await this.openaiClient.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content creator specializing in case studies.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      });

      const responseText = completion.choices[0]?.message?.content;
      
      if (!responseText) {
        throw new Error('No response received from OpenAI');
      }

      return this.parseAIResponse(responseText, input);
    } catch (error) {
      console.error('OpenAI Service Error:', error);
      throw new Error(`Failed to generate case study with OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateWithOllama(input: GenerationInput, model: string = 'llama2'): Promise<AIResponse> {
    try {
      const prompt = this.buildPrompt(input);
      
      const response = await axios.post(`${this.ollamaEndpoint}/api/generate`, {
        model: model,
        prompt: `You are an expert educational content creator specializing in case studies.\n\n${prompt}`,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          top_k: 40,
        }
      }, {
        timeout: 120000, // 2 minutes timeout for local models
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const responseText = response.data.response;
      
      if (!responseText) {
        throw new Error('No response received from Ollama');
      }

      return this.parseAIResponse(responseText, input);
    } catch (error) {
      console.error('Ollama Service Error:', error);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Cannot connect to Ollama. Please ensure Ollama is running on http://localhost:11434');
        }
        throw new Error(`Ollama API error: ${error.response?.data?.error || error.message}`);
      }
      throw new Error(`Failed to generate case study with Ollama: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseAIResponse(responseText: string, input?: GenerationInput): AIResponse {
    const sections = responseText.split('**');
    
    let title = 'Untitled Case Study';
    let content = '';
    let questions = '';
    let answers = '';
    let tags: string[] = [];

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim();
      
      if (section.toLowerCase().includes('title')) {
        title = sections[i + 1]?.trim() || title;
      } else if (section.toLowerCase().includes('case study')) {
        content = sections[i + 1]?.trim() || '';
      } else if (section.toLowerCase().includes('analysis questions')) {
        questions = sections[i + 1]?.trim() || '';
      } else if (section.toLowerCase().includes('model answers')) {
        answers = sections[i + 1]?.trim() || '';
      } else if (section.toLowerCase().includes('tags')) {
        const tagText = sections[i + 1]?.trim() || '';
        tags = tagText.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
    }

    // Fallback parsing if the structured format isn't followed
    if (!content && responseText.length > 0) {
      content = responseText;
    }

    return {
      title: title.replace(/[:\[\]]/g, '').trim(),
      content: content || responseText,
      questions: questions || 'No analysis questions provided.',
      answers: answers || undefined,
      tags: tags.length > 0 ? tags : ['case-study', input?.domain?.toLowerCase() || 'general']
    };
  }

  async regenerateSection(section: string, context: any): Promise<string> {
    if (!this.openaiClient) {
      throw new Error('AI client not initialized');
    }

    const prompt = `Please regenerate the ${section} section of this case study with the following context:
    
${JSON.stringify(context, null, 2)}

Make it more engaging and detailed while maintaining the same educational objectives.`;

    try {
      const completion = await this.openaiClient.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1500,
      });

      return completion.choices[0]?.message?.content || 'Failed to regenerate section';
    } catch (error) {
      console.error('Regeneration Error:', error);
      throw new Error('Failed to regenerate section');
    }
  }

  async suggestContext(domain: string, complexity: string, scenarioType: string, provider: string = 'openai', model: string = 'gpt-4', apiKey?: string, endpoint?: string): Promise<string> {
    const prompt = `Generate a detailed context setting for a ${complexity.toLowerCase()} level ${domain.toLowerCase()} case study focused on ${scenarioType.toLowerCase()}.

The context should include:
- Organization/company name and brief description
- Industry and market context
- Key stakeholders or characters
- Relevant background situation
- Setting (location, time period if relevant)
- Any specific challenges or circumstances

Make it realistic, engaging, and appropriate for educational purposes. Keep it concise but informative (2-3 paragraphs).

Example format:
"[Company Name] is a [size] [industry] company based in [location]... [situation/challenge]..."`;

    try {
      if (provider === 'ollama') {
        if (endpoint) {
          const originalEndpoint = this.ollamaEndpoint;
          this.ollamaEndpoint = endpoint;
          const result = await this.generateContextWithOllama(prompt, model);
          this.ollamaEndpoint = originalEndpoint;
          return result;
        } else {
          return await this.generateContextWithOllama(prompt, model);
        }
      } else {
        if (!this.openaiClient && apiKey) {
          this.initializeOpenAI(apiKey);
        }
        
        if (!this.openaiClient) {
          throw new Error('AI client not initialized');
        }

        const completion = await this.openaiClient.chat.completions.create({
          model: model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
        });

        return completion.choices[0]?.message?.content || 'Failed to generate context suggestion';
      }
    } catch (error) {
      console.error('Context Suggestion Error:', error);
      throw new Error('Failed to generate context suggestion');
    }
  }

  private async generateContextWithOllama(prompt: string, model: string): Promise<string> {
    try {
      const response = await axios.post(`${this.ollamaEndpoint}/api/generate`, {
        model: model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 500,
        }
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const responseText = response.data.response;
      
      if (!responseText) {
        throw new Error('No response received from Ollama');
      }

      return responseText;
    } catch (error) {
      console.error('Ollama Context Generation Error:', error);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Cannot connect to Ollama. Please ensure Ollama is running and check your endpoint configuration.');
        }
        throw new Error(`Ollama API error: ${error.response?.data?.error || error.message}`);
      }
      throw new Error(`Failed to generate context with Ollama: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Method to validate and estimate costs
  estimateTokens(input: GenerationInput): number {
    const prompt = this.buildPrompt(input);
    // Rough estimation: 1 token ≈ 0.75 words
    return Math.ceil(prompt.length / 3);
  }

  // Test API connection
  async testConnection(provider: string, apiKey?: string, endpoint?: string): Promise<boolean> {
    try {
      switch (provider.toLowerCase()) {
        case 'ollama':
          return await this.testOllamaConnection(endpoint);
        case 'openai':
        default:
          return await this.testOpenAIConnection(apiKey!);
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  private async testOpenAIConnection(apiKey: string): Promise<boolean> {
    try {
      const testClient = new OpenAI({ apiKey });
      
      await testClient.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5,
      });
      
      return true;
    } catch (error) {
      console.error('OpenAI connection test failed:', error);
      return false;
    }
  }

  private async testOllamaConnection(endpoint?: string): Promise<boolean> {
    try {
      const ollamaUrl = endpoint || this.ollamaEndpoint;
      const response = await axios.get(`${ollamaUrl}/api/tags`, {
        timeout: 5000
      });
      
      return response.status === 200;
    } catch (error) {
      console.error('Ollama connection test failed:', error);
      return false;
    }
  }

  // Get available Ollama models
  async getOllamaModels(endpoint?: string): Promise<OllamaModel[]> {
    try {
      const ollamaUrl = endpoint || this.ollamaEndpoint;
      const response = await axios.get(`${ollamaUrl}/api/tags`, {
        timeout: 10000
      });
      
      return response.data.models || [];
    } catch (error) {
      console.error('Failed to fetch Ollama models:', error);
      if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to Ollama. Please ensure Ollama is running.');
      }
      throw new Error('Failed to fetch available models from Ollama');
    }
  }

  // Set custom Ollama endpoint
  setOllamaEndpoint(endpoint: string): void {
    this.ollamaEndpoint = endpoint;
  }
}