import React, { createContext, useContext, useState } from 'react';
import { Article } from '../types/article';

interface StreamData {
  title?: string;
  status?: string;
  outputs?: {
    title_list?: string[];
    context?: string;
    keywords?: string[];
  };
  error?: string;
  timestamp?: number;
}

interface ArticleConfig {
  data: StreamData[];
  loading: boolean;
  error: string | null;
}

interface ArticleConfigs {
  [key: string]: ArticleConfig;
}

interface VideoConfigContextType {
  articleConfigs: ArticleConfigs;
  setArticleConfigs: React.Dispatch<React.SetStateAction<ArticleConfigs>>;
}

const VideoConfigContext = createContext<VideoConfigContextType | null>(null);

export function VideoConfigProvider({ children }: { children: React.ReactNode }) {
  const [articleConfigs, setArticleConfigs] = useState<ArticleConfigs>({});

  return (
    <VideoConfigContext.Provider value={{ articleConfigs, setArticleConfigs }}>
      {children}
    </VideoConfigContext.Provider>
  );
}

export function useVideoConfig() {
  const context = useContext(VideoConfigContext);
  if (!context) {
    throw new Error('useVideoConfig must be used within a VideoConfigProvider');
  }
  return context;
}
