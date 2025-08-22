import { z } from 'zod';

export const ChatHistoryItemSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.number(),
});

export const ChatContextSchema = z.object({
  caseType: z.string().optional(),
  currentStage: z.number().int().min(0).max(12).optional(),
  previousAnalysis: z.string().optional(),
});

export const ChatRequestSchema = z.object({
  message: z.string().min(3),
  apiKey: z.string().min(1),
  conversationHistory: z.array(ChatHistoryItemSchema).optional().default([]),
  context: ChatContextSchema.optional(),
});

export const ChatModelResponseSchema = z.object({
  answer: z.string().min(1),
  suggestions: z.array(z.string()).max(5).optional().default([]),
  nextSteps: z.array(z.string()).max(5).optional().default([]),
  confidence: z.number().min(0).max(1).optional(),
});

export type ChatModelResponse = z.infer<typeof ChatModelResponseSchema>; 