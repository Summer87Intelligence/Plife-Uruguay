import type {
  AIStage, AICategory, AIPrompt, AIAnalysisProfile, AIProfilePrompt, AIExecutionRun, AIPromptSuggestion,
} from '@/types/database'

export interface IAEngineProps {
  stages: AIStage[]
  categories: AICategory[]
  prompts: AIPrompt[]
  profiles: AIAnalysisProfile[]
  profilePrompts: AIProfilePrompt[]
  executionRuns: AIExecutionRun[]
  promptSuggestions: AIPromptSuggestion[]
}

export type MainTab =
  | 'dashboard'
  | 'configuracion'
  | 'prompts'
  | 'categorias'
  | 'perfiles'
  | 'ejecuciones'
