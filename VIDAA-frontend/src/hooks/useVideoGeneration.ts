import { useState } from 'react';
import { VideoGenerationState, VideoStep } from '../types/video';
import { Article } from '../types/article';
import { RSSSource } from '../types/rss';

const INITIAL_STEPS: VideoStep[] = [
  {
    number: 1,
    title: "Select Articles",
    description: "Choose articles to generate video from",
    id: "articles",
    enabled: true
  },
  {
    number: 2,
    title: "Generate",
    description: "Start video generation process",
    id: "generate",
    enabled: false
  }
];

export function useVideoGeneration() {
  const [state, setState] = useState<VideoGenerationState>({
    currentStep: INITIAL_STEPS[0].id,
    selectedRSS: null,
    selectedArticles: [],
  });

  const steps = INITIAL_STEPS.map(step => ({
    ...step,
    enabled: step.id === 'articles' ||
             (step.id === 'generate' && state.selectedArticles.length > 0)
  }));

  const handleRSSSelect = (source: RSSSource | null) => {
    setState(prev => ({ ...prev, selectedRSS: source }));
  };

  const handleArticleSelect = (article: Article, selected: boolean) => {
    setState(prev => ({
      ...prev,
      selectedArticles: selected
        ? [...prev.selectedArticles, article]
        : prev.selectedArticles.filter(a => a.link !== article.link)
    }));
  };

  const setCurrentStep = (stepId: string) => {
    setState(prev => ({ ...prev, currentStep: stepId }));
  };

  return {
    state,
    steps,
    handleRSSSelect,
    handleArticleSelect,
    setCurrentStep,
  };
}
