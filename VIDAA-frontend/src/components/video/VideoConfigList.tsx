import { useState, useEffect } from 'react';
import { Article } from '../../types/article';
import { Button } from '@heroui/react';
import { getApiUrl } from '../../constants/api';
import { useVideoConfig } from '../../contexts/VideoConfigContext';

interface VideoConfigListProps {
  articles: Article[];
}

interface ArticleConfig {
  data: StreamData[];
  loading: boolean;
  error: string | null;
}

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

interface ArticleConfigs {
  [key: string]: ArticleConfig;
}

export function VideoConfigList({ articles }: VideoConfigListProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const { articleConfigs, setArticleConfigs } = useVideoConfig();

  // Reconnect to EventSource for any articles that were in progress
  useEffect(() => {
    Object.entries(articleConfigs).forEach(([link, config]) => {
      if (config.loading) {
        const article = articles.find(a => a.link === link);
        if (article) {
          handleGetConfig(article, true);
        }
      }
    });
  }, []); // Only run on mount

  const handleGetConfig = (article: Article, keepExistingData = false) => {
    console.log('Getting config for article:', article.link);
    try {
      const url = getApiUrl('DIFY', { url: article.link });

      if (articleConfigs[article.link]?.loading && !keepExistingData) {
        console.log('Already processing this article');
        return;
      }

      const eventSource = new EventSource(url);

      setArticleConfigs(prev => ({
        ...prev,
        [article.link]: {
          data: keepExistingData ? prev[article.link]?.data || [] : [],
          loading: true,
          error: null
        }
      }));

      eventSource.onmessage = (event) => {
        const newData: StreamData = {
          ...JSON.parse(event.data),
          timestamp: Date.now()
        };

        setArticleConfigs(prev => {
          const existingData = prev[article.link]?.data || [];
          const isDuplicate = existingData.some(
            item => item.title === newData.title && item.status === newData.status
          );

          return {
            ...prev,
            [article.link]: {
              ...prev[article.link],
              data: isDuplicate ? existingData : [...existingData, newData]
            }
          };
        });
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
        setArticleConfigs(prev => ({
          ...prev,
          [article.link]: {
            ...prev[article.link],
            loading: false,
            error: 'Failed to get configuration'
          }
        }));
      };

      eventSource.addEventListener('complete', () => {
        eventSource.close();
        setArticleConfigs(prev => ({
          ...prev,
          [article.link]: {
            ...prev[article.link],
            loading: false
          }
        }));
      });

    } catch (error) {
      console.error('Error setting up EventSource:', error);
    }
  };

  const getArticleStatus = (article: Article) => {
    const config = articleConfigs[article.link];
    if (!config) return null;

    const { data, loading } = config;
    const latestData = data[data.length - 1];
    const isCompleted = data.some(d => d.title === '结束' && d.status === 'completed');
    const finalData = isCompleted ? data.find(d =>
      d.status === 'succeeded' || d.status === 'failed'
    ) : null;

    return {
      loading,
      latestData,
      isCompleted,
      finalData,
      allData: data
    };
  };

  const getStatusColor = (article: Article) => {
    const status = getArticleStatus(article);
    if (!status) return 'bg-gray-300';
    if (!status.isCompleted) return status.loading ? 'bg-blue-500' : 'bg-gray-300';
    return status.finalData?.status === 'succeeded' ? 'bg-green-500' : 'bg-red-500';
  };

  return (
    <div className="space-y-4">
      {articles.map((article, index) => (
        <div
          key={article.link}
          className="border rounded-lg overflow-hidden hover:border-blue-300 transition-colors"
        >
          <div
            className="p-4 flex justify-between items-center cursor-pointer"
            onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
          >
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-800">{article.title}</h3>
              {articleConfigs[article.link] && (
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(article)} ${
                    getArticleStatus(article)?.loading ? 'animate-pulse' : ''
                  }`} />
                  <span className="text-sm text-gray-600">
                    {getArticleStatus(article)?.loading ? 'Processing...' :
                     getArticleStatus(article)?.isCompleted ? 'Completed' :
                     getArticleStatus(article)?.latestData?.status || 'Waiting to start'}
                  </span>
                  {getArticleStatus(article)?.latestData?.title && !getArticleStatus(article)?.isCompleted && (
                    <span className="text-sm text-gray-500">• {getArticleStatus(article)?.latestData?.title}</span>
                  )}
                </div>
              )}
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ml-4 ${
                expandedIndex === index ? 'transform rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          {expandedIndex === index && (
            <div className="px-4 pb-4 pt-2 border-t bg-gray-50">
              <div className="flex justify-end mb-4">
                <div className="flex gap-2">
                  {getArticleStatus(article)?.loading && !getArticleStatus(article)?.isCompleted && (
                    <Button
                      color="danger"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setArticleConfigs(prev => ({
                          ...prev,
                          [article.link]: {
                            data: [],
                            loading: false,
                            error: null
                          }
                        }));
                      }}
                      className="px-4 rounded-full bg-red-50 text-red-600 hover:bg-red-100 border-none shadow-sm"
                    >
                      Stop
                    </Button>
                  )}
                  <Button
                    color="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGetConfig(article);
                    }}
                    className={`px-4 rounded-full border-none shadow-sm text-white ${
                      getArticleStatus(article)?.loading
                        ? 'bg-blue-400'
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {getArticleStatus(article)?.loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="text-white">Processing</span>
                      </div>
                    ) : (
                      articleConfigs[article.link] ? 'Regenerate' : 'Get Config'
                    )}
                  </Button>
                </div>
              </div>

              {getArticleStatus(article) && (
                <div className="space-y-4">
                  {getArticleStatus(article)?.finalData?.outputs && (
                    <div className="bg-white rounded-lg border p-4 space-y-6">
                      {getArticleStatus(article)?.finalData.outputs.context && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-700">口播稿</h4>
                          <div className="p-4 bg-gray-50 rounded-lg text-gray-600 whitespace-pre-wrap">
                            {getArticleStatus(article)?.finalData.outputs.context}
                          </div>
                        </div>
                      )}

                      {getArticleStatus(article)?.finalData.outputs.title_list && getArticleStatus(article)?.finalData.outputs.title_list.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-700">待选标题</h4>
                          <div className="space-y-2">
                            {getArticleStatus(article)?.finalData.outputs.title_list.map((title, index) => (
                              <div
                                key={index}
                                className="p-3 bg-gray-50 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                              >
                                {title}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-700">背景图关键字</h4>
                        <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-gray-50 rounded-lg">
                          {getArticleStatus(article)?.finalData.outputs.keywords && getArticleStatus(article)?.finalData.outputs.keywords.length > 0 ? (
                            getArticleStatus(article)?.finalData.outputs.keywords.map((keyword, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                              >
                                {keyword}
                              </span>
                            ))
                          ) : (
                            <div className="text-sm text-gray-400 w-full text-center">
                              No keywords available
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {getArticleStatus(article)?.finalData?.status === 'failed' &&
                   getArticleStatus(article)?.finalData?.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-red-600 font-medium mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        处理失败
                      </div>
                      <div className="text-red-700 bg-red-100 rounded p-3 font-mono text-sm">
                        {getArticleStatus(article)?.finalData.error}
                      </div>
                    </div>
                  )}

                  {!getArticleStatus(article)?.finalData && (
                    <div className="text-center text-gray-500 py-8">
                      {getArticleStatus(article)?.loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        'Click "Get Config" to start processing'
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
