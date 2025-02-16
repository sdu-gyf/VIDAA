export interface VideoStep {
  number: number;
  title: string;
  description: string;
  id: string;
  enabled: boolean;
}

export interface VideoGenerationState {
  currentStep: string;
  selectedRSS: RSSSource | null;
  selectedArticles: Article[];
}
