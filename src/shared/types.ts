export interface CaseStudy {
  id?: number;
  title: string;
  domain: string;
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  scenario_type: 'Problem-solving' | 'Decision-making' | 'Ethical Dilemma' | 'Strategic Planning';
  content: string;
  questions: string;
  answers?: string;
  created_date?: string;
  modified_date?: string;
  tags: string[];
  is_favorite: boolean;
  word_count: number;
  usage_count: number;
  collection_ids?: number[];
}

export interface Collection {
  id?: number;
  name: string;
  description?: string;
  color?: string;
  parent_collection_id?: number;
  created_date?: string;
  modified_date?: string;
  case_count?: number;
  subcollection_count?: number;
}

export interface Bundle {
  bundle_info: {
    title: string;
    description: string;
    exported_by: string;
    exported_at: string;
    version: string;
    total_collections: number;
    total_cases: number;
  };
  collections: Collection[];
  cases: CaseStudy[];
  collection_hierarchies: Array<{
    collection_id: number;
    case_ids: number[];
    subcollection_ids: number[];
  }>;
}

export interface GenerationInput {
  domain: string;
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  scenario_type: 'Problem-solving' | 'Decision-making' | 'Ethical Dilemma' | 'Strategic Planning';
  context_setting: string;
  key_concepts: string;
  length_preference: 'Short' | 'Medium' | 'Long';
  custom_prompt: string;
  include_elements: {
    executive_summary: boolean;
    background: boolean;
    problem_statement: boolean;
    supporting_data: boolean;
    key_characters: boolean;
    analysis_questions: boolean;
    learning_objectives: boolean;
    suggested_solutions: boolean;
  };
}

export interface AIUsage {
  id?: number;
  provider: string;
  model: string;
  tokens_used: number;
  cost_estimate: number;
  timestamp?: string;
  case_id?: number;
}

export interface PracticeSession {
  id?: number;
  case_id: number;
  start_time?: string;
  end_time?: string;
  notes: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  default_ai_provider: string;
  default_ai_model: string;
  default_ollama_model?: string;
  api_keys: Record<string, string>;
  default_generation_settings: Partial<GenerationInput>;
  default_home_page: 'generation' | 'library' | 'practice' | 'documentation' | 'settings';
  ollama_endpoint?: string;
  enable_practice_ai_analysis?: boolean;
  enable_high_contrast?: boolean;
}

export interface AIProvider {
  name: string;
  models: string[];
  api_key_required: boolean;
  cost_per_token: number;
  endpoint?: string;
  local?: boolean;
}

export interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
}

export interface DocumentationPage {
  id: string;
  title: string;
  category: 'Getting Started' | 'User Guides' | 'AI Setup' | 'Technical' | 'Reference';
  userType: 'student' | 'educator' | 'administrator' | 'developer' | 'all';
  content: string; // Markdown content
  description: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime: number; // minutes
  lastUpdated: string;
  isBuiltIn: boolean; // true for default docs, false for user-customized
  section?: string; // subcategory within main category
}

export interface DocumentationFilters {
  searchQuery?: string;
  category?: string;
  userType?: string;
  difficulty?: string;
  tags?: string[];
}