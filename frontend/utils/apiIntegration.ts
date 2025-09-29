/**
 * Unified API Integration Module
 * وحدة تكامل API موحدة لدعم مختلف مزودي الخدمة
 */

import { 
  createAIProvider, 
  getProviderFromModel, 
  getModelConfig, 
  type AIRequest, 
  type AIResponse, 
  type AIProvider,
  type ModelConfig 
} from './aiProvider';
import { getApiKeyForProvider } from './appSettings';
import { checkRateLimitForKey } from './cache';

export type AnalysisRequest = {
  text: string;
  modelId: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  useCache?: boolean;
  rateLimitKey?: string;
};

export type AnalysisResponse = {
  text: string;
  model: string;
  provider: AIProvider;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCost?: number;
  };
  cached?: boolean;
  timestamp: number;
};

/**
 * Enhanced error handling for different providers
 */
export class AIProviderError extends Error {
  constructor(
    message: string,
    public provider: AIProvider,
    public code?: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}

/**
 * Rate limiting configuration per provider
 */
const RATE_LIMITS: Record<AIProvider, number> = {
  google: 15, // requests per minute
  openrouter: 60 // requests per minute (varies by model)
};

/**
 * Cost estimation per 1K tokens (rough estimates in USD)
 */
const TOKEN_COSTS: Record<string, { input: number; output: number }> = {
  'gemini-1.5-flash': { input: 0, output: 0 }, // Free tier
  'gemini-1.5-pro': { input: 0.00125, output: 0.005 },
  'gemini-2.0-flash': { input: 0.0001875, output: 0.00075 },
  'anthropic/claude-3.5-sonnet': { input: 0.003, output: 0.015 },
  'openai/gpt-4o': { input: 0.0025, output: 0.01 },
  'meta-llama/llama-3.2-90b-vision-instruct': { input: 0.0009, output: 0.0009 },
  'google/gemma-2-27b-it': { input: 0.00027, output: 0.00027 }
};

/**
 * Main function to call AI services with unified interface
 */
export async function callAIService(request: AnalysisRequest): Promise<AnalysisResponse> {
  const provider = getProviderFromModel(request.modelId);
  const modelConfig = getModelConfig(request.modelId);
  
  if (!modelConfig) {
    throw new AIProviderError(
      `Model ${request.modelId} not found`,
      provider,
      'MODEL_NOT_FOUND'
    );
  }

  // Check rate limits
  if (request.rateLimitKey) {
    const rateLimitStatus = checkRateLimitForKey(
      request.rateLimitKey, 
      RATE_LIMITS[provider], 
      false // not sequential analysis
    );
    
    if (!rateLimitStatus.allowed) {
      throw new AIProviderError(
        `Rate limit exceeded. Try again in ${Math.ceil((rateLimitStatus.resetTime - Date.now()) / 1000)} seconds`,
        provider,
        'RATE_LIMIT_EXCEEDED',
        true
      );
    }
  }

  // Get API key for the provider
  const apiKey = await getApiKeyForProvider(provider);
  if (!apiKey) {
    throw new AIProviderError(
      `API key not found for provider: ${provider}`,
      provider,
      'API_KEY_MISSING'
    );
  }

  try {
    // Create provider instance and make request
    const providerInstance = createAIProvider(provider, apiKey, request.modelId);
    
    const aiRequest: AIRequest = {
      prompt: request.text,
      systemPrompt: request.systemPrompt,
      temperature: request.temperature || 0.7,
      maxTokens: request.maxTokens || modelConfig.maxTokens || 4000
    };

    const response = await providerInstance.generateContent(aiRequest);
    
    // Calculate cost estimate
    const estimatedCost = calculateCost(
      request.modelId,
      response.usage?.promptTokens || 0,
      response.usage?.completionTokens || 0
    );

    return {
      ...response,
      usage: {
        ...response.usage!,
        estimatedCost
      },
      timestamp: Date.now()
    };

  } catch (error: any) {
    // Enhanced error handling with provider-specific messages
    let message = error.message || 'Unknown error occurred';
    let code = 'UNKNOWN_ERROR';
    let retryable = false;

    if (provider === 'google') {
      if (error.message?.includes('API key')) {
        code = 'INVALID_API_KEY';
        message = 'مفتاح Google API غير صالح أو منتهي الصلاحية';
      } else if (error.message?.includes('quota')) {
        code = 'QUOTA_EXCEEDED';
        message = 'تم تجاوز حد الاستخدام المجاني لـ Google';
        retryable = true;
      } else if (error.message?.includes('model not found')) {
        code = 'MODEL_NOT_FOUND';
        message = 'النموذج المطلوب غير متوفر';
      }
    } else if (provider === 'openrouter') {
      if (error.message?.includes('401')) {
        code = 'INVALID_API_KEY';
        message = 'مفتاح OpenRouter API غير صالح';
      } else if (error.message?.includes('402')) {
        code = 'INSUFFICIENT_CREDITS';
        message = 'رصيد OpenRouter غير كافي';
      } else if (error.message?.includes('429')) {
        code = 'RATE_LIMIT_EXCEEDED';
        message = 'تم تجاوز حد الطلبات في OpenRouter';
        retryable = true;
      } else if (error.message?.includes('model')) {
        code = 'MODEL_NOT_AVAILABLE';
        message = 'النموذج غير متوفر حالياً في OpenRouter';
        retryable = true;
      }
    }

    throw new AIProviderError(message, provider, code, retryable);
  }
}

/**
 * Validate API key for a specific provider
 */
export async function validateProviderApiKey(
  provider: AIProvider, 
  apiKey: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const providerInstance = createAIProvider(provider, apiKey, 
      provider === 'openrouter' ? 'google/gemma-2-27b-it' : undefined
    );
    
    const isValid = await providerInstance.validateApiKey(apiKey);
    if (isValid) {
      return { valid: true };
    } else {
      // Provide specific error messages based on provider
      let errorMessage = 'مفتاح API غير صالح';
      if (provider === 'openrouter') {
        errorMessage = 'مفتاح OpenRouter غير صالح أو منتهي الصلاحية';
      } else if (provider === 'google') {
        errorMessage = 'مفتاح Google API غير صالح أو منتهي الصلاحية';
      }
      return { valid: false, error: errorMessage };
    }
  } catch (error: any) {
    return { 
      valid: false, 
      error: error.message || 'فشل في التحقق من مفتاح API' 
    };
  }
}

/**
 * Get available models for a provider
 */
export async function getAvailableModels(provider: AIProvider): Promise<ModelConfig[]> {
  try {
    const apiKey = await getApiKeyForProvider(provider);
    if (!apiKey) {
      return [];
    }

    const providerInstance = createAIProvider(provider, apiKey);
    return providerInstance.getModels();
  } catch {
    return [];
  }
}

/**
 * Calculate estimated cost for a request
 */
function calculateCost(modelId: string, promptTokens: number, completionTokens: number): number {
  const costs = TOKEN_COSTS[modelId];
  if (!costs) return 0;

  const inputCost = (promptTokens / 1000) * costs.input;
  const outputCost = (completionTokens / 1000) * costs.output;
  
  return inputCost + outputCost;
}

/**
 * Get recommended model based on task complexity and budget
 */
export function getRecommendedModel(
  complexity: 'simple' | 'medium' | 'complex',
  budget: 'free' | 'low' | 'high',
  provider?: AIProvider
): string {
  if (budget === 'free') {
    return 'gemini-1.5-flash';
  }

  if (provider === 'openrouter') {
    switch (complexity) {
      case 'simple':
        return budget === 'low' ? 'google/gemma-2-27b-it' : 'meta-llama/llama-3.2-90b-vision-instruct';
      case 'medium':
        return 'meta-llama/llama-3.2-90b-vision-instruct';
      case 'complex':
        return budget === 'high' ? 'anthropic/claude-3.5-sonnet' : 'openai/gpt-4o';
      default:
        return 'google/gemma-2-27b-it';
    }
  }

  // Google models
  switch (complexity) {
    case 'simple':
      return 'gemini-1.5-flash';
    case 'medium':
      return budget === 'high' ? 'gemini-1.5-pro' : 'gemini-2.0-flash';
    case 'complex':
      return 'gemini-1.5-pro';
    default:
      return 'gemini-1.5-flash';
  }
}

/**
 * Health check for all configured providers
 */
export async function checkProvidersHealth(): Promise<Record<AIProvider, boolean>> {
  const results: Record<AIProvider, boolean> = {
    google: false,
    openrouter: false
  };

  // Check Google
  try {
    const googleKey = await getApiKeyForProvider('google');
    if (googleKey) {
      const { valid } = await validateProviderApiKey('google', googleKey);
      results.google = valid;
    }
  } catch {}

  // Check OpenRouter
  try {
    const openRouterKey = await getApiKeyForProvider('openrouter');
    if (openRouterKey) {
      const { valid } = await validateProviderApiKey('openrouter', openRouterKey);
      results.openrouter = valid;
    }
  } catch {}

  return results;
}