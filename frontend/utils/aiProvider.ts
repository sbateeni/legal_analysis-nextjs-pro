/**
 * AI Provider Abstraction Layer
 * يدعم متعددة مزودي خدمات الذكاء الاصطناعي
 */

export type AIProvider = 'google' | 'openrouter';

export type ModelConfig = {
  id: string;
  name: string;
  provider: AIProvider;
  maxTokens?: number;
  costTier: 'free' | 'low' | 'medium' | 'high';
  description: string;
  arabicDescription: string;
};

export const AVAILABLE_MODELS: ModelConfig[] = [
  // Google Gemini Models
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    maxTokens: 1048576,
    costTier: 'free',
    description: 'Fast and efficient for most tasks',
    arabicDescription: 'سريع وفعال لمعظم المهام (مجاني)'
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    maxTokens: 2097152,
    costTier: 'medium',
    description: 'Advanced reasoning for complex tasks',
    arabicDescription: 'تفكير متقدم للمهام المعقدة (مدفوع)'
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    maxTokens: 1048576,
    costTier: 'medium',
    description: 'Latest generation, faster performance',
    arabicDescription: 'الجيل الأحدث، أداء أسرع (مدفوع)'
  },
  
  // OpenRouter Models
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'openrouter',
    maxTokens: 200000,
    costTier: 'high',
    description: 'Excellent for legal analysis and reasoning',
    arabicDescription: 'ممتاز للتحليل القانوني والتفكير (مدفوع)'
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4 Omni',
    provider: 'openrouter',
    maxTokens: 128000,
    costTier: 'high',
    description: 'Powerful reasoning and analysis',
    arabicDescription: 'تفكير وتحليل قوي (مدفوع)'
  },
  {
    id: 'meta-llama/llama-3.2-90b-vision-instruct',
    name: 'Llama 3.2 90B',
    provider: 'openrouter',
    maxTokens: 131072,
    costTier: 'medium',
    description: 'Open source, good performance',
    arabicDescription: 'مفتوح المصدر، أداء جيد (مدفوع)'
  },
  {
    id: 'google/gemma-2-27b-it',
    name: 'Gemma 2 27B',
    provider: 'openrouter',
    maxTokens: 8192,
    costTier: 'low',
    description: 'Lightweight and cost-effective',
    arabicDescription: 'خفيف واقتصادي (مدفوع منخفض)'
  }
];

export type AIRequest = {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
};

export type AIResponse = {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: AIProvider;
};

export interface AIProviderInterface {
  generateContent(request: AIRequest): Promise<AIResponse>;
  validateApiKey(apiKey: string): Promise<boolean>;
  getModels(): ModelConfig[];
}

/**
 * Google Gemini Provider Implementation
 */
export class GoogleProvider implements AIProviderInterface {
  constructor(private apiKey: string) {}

  async generateContent(request: AIRequest): Promise<AIResponse> {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    
    if (!this.apiKey) {
      throw new Error('Google API key is required');
    }

    const genAI = new GoogleGenerativeAI(this.apiKey);
    const modelId = this.getModelId();
    const model = genAI.getGenerativeModel({ model: modelId });

    const result = await model.generateContent(request.prompt);
    const response = await result.response;
    const text = response.text();

    return {
      text,
      model: modelId,
      provider: 'google',
      usage: {
        promptTokens: 0, // Gemini doesn't provide detailed usage
        completionTokens: 0,
        totalTokens: 0
      }
    };
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      // Test with a simple prompt
      await model.generateContent('Test');
      return true;
    } catch {
      return false;
    }
  }

  getModels(): ModelConfig[] {
    return AVAILABLE_MODELS.filter(m => m.provider === 'google');
  }

  private getModelId(): string {
    // Default to flash if not specified
    return 'gemini-1.5-flash';
  }
}

/**
 * OpenRouter Provider Implementation
 */
export class OpenRouterProvider implements AIProviderInterface {
  constructor(private apiKey: string, private modelId: string) {}

  async generateContent(request: AIRequest): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is required');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://legal-analysis.vercel.app',
        'X-Title': 'Legal Analysis Pro'
      },
      body: JSON.stringify({
        model: this.modelId,
        messages: [
          ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
          { role: 'user', content: request.prompt }
        ],
        max_tokens: request.maxTokens || 4000,
        temperature: request.temperature || 0.7
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${error}`);
    }

    const data = await response.json();
    
    return {
      text: data.choices[0]?.message?.content || '',
      model: this.modelId,
      provider: 'openrouter',
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0
      }
    };
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        }
      });
      
      if (response.ok) {
        return true;
      } else {
        // Try to get error details
        try {
          const errorData = await response.json();
          console.error('OpenRouter API key validation failed:', errorData);
        } catch {
          console.error('OpenRouter API key validation failed with status:', response.status);
        }
        return false;
      }
    } catch (error) {
      console.error('OpenRouter API key validation error:', error);
      return false;
    }
  }

  getModels(): ModelConfig[] {
    return AVAILABLE_MODELS.filter(m => m.provider === 'openrouter');
  }
}

/**
 * Factory function to create AI provider instances
 */
export function createAIProvider(
  provider: AIProvider, 
  apiKey: string, 
  modelId?: string
): AIProviderInterface {
  switch (provider) {
    case 'google':
      return new GoogleProvider(apiKey);
    case 'openrouter':
      if (!modelId) {
        throw new Error('Model ID is required for OpenRouter');
      }
      return new OpenRouterProvider(apiKey, modelId);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Helper function to get model configuration by ID
 */
export function getModelConfig(modelId: string): ModelConfig | undefined {
  return AVAILABLE_MODELS.find(m => m.id === modelId);
}

/**
 * Helper function to get provider from model ID
 */
export function getProviderFromModel(modelId: string): AIProvider {
  const model = getModelConfig(modelId);
  return model?.provider || 'google';
}

/**
 * Helper function to get models by provider
 */
export function getModelsByProvider(provider: AIProvider): ModelConfig[] {
  return AVAILABLE_MODELS.filter(m => m.provider === provider);
}