import type {
  AIStage, AICategory, AIPrompt, AIAnalysisProfile, AIProfilePrompt, AIExecutionRun, AIPromptSuggestion, AIExecutionOutput,
} from '@/types/database'

export type EntityNameMap = Record<string, string>

export interface IAEngineProps {
  stages: AIStage[]
  categories: AICategory[]
  prompts: AIPrompt[]
  profiles: AIAnalysisProfile[]
  profilePrompts: AIProfilePrompt[]
  executionRuns: AIExecutionRun[]
  executionOutputs: AIExecutionOutput[]
  promptSuggestions: AIPromptSuggestion[]
  entityNames: EntityNameMap
}

export type MainTab =
  | 'dashboard'
  | 'configuracion'
  | 'prompts'
  | 'categorias'
  | 'perfiles'
  | 'ejecuciones'
