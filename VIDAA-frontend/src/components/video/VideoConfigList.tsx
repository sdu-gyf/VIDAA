import { useState, useEffect, useCallback } from 'react';
import { Article } from '../../types/article';
import { Button } from '@heroui/react';
import { getApiUrl } from '../../constants/api';
import { useVideoConfig } from '../../contexts/VideoConfigContext';
import { useClickAway } from 'react-use';
import { useRef } from 'react';
import { ErrorDisplay } from '../common/ErrorDisplay';

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
  selectedTitle?: string;
}

interface ArticleConfigs {
  [key: string]: ArticleConfig;
}

export function VideoConfigList({ articles }: VideoConfigListProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const { articleConfigs, setArticleConfigs } = useVideoConfig();

  const [editingContext, setEditingContext] = useState<string | null>(null);
  const [editingTitleIndex, setEditingTitleIndex] = useState<{articleLink: string, index: number} | null>(null);

  const contextRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useClickAway(contextRef, () => {
    if (editingContext !== null) {
      handleContextUpdate();
    }
  });

  useClickAway(titleRef, () => {
    if (editingTitleIndex !== null) {
      handleTitleUpdate();
    }
  });

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

      // Set a timeout to check if the connection has failed
      const connectionTimeout = setTimeout(() => {
        if (articleConfigs[article.link]?.loading && !articleConfigs[article.link]?.data.length) {
          eventSource.close();
          setArticleConfigs(prev => ({
            ...prev,
            [article.link]: {
              ...prev[article.link],
              loading: false,
              error: 'Backend connection timeout. Please try again later.'
            }
          }));
        }
      }, 10000); // 10 seconds timeout

      eventSource.onmessage = (event) => {
        try {
          const newData: StreamData = {
            ...JSON.parse(event.data),
            timestamp: Date.now()
          };

          // Log the event data to debug
          console.log('Received EventSource data:', newData);

          // Check if this is an error response
          const isError = newData.status === 'failed';

          setArticleConfigs(prev => {
            const existingData = prev[article.link]?.data || [];
            const isDuplicate = existingData.some(
              item => item.title === newData.title && item.status === newData.status
            );

            return {
              ...prev,
              [article.link]: {
                ...prev[article.link],
                data: isDuplicate ? existingData : [...existingData, newData],
                loading: !isError, // Stop loading if we got an error
              }
            };
          });
        } catch (e) {
          console.error('Error parsing EventSource data:', e);
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
        clearTimeout(connectionTimeout);

        // We shouldn't hardcode the error message here
        // The actual error will come through the message event with status="failed"
        setArticleConfigs(prev => ({
          ...prev,
          [article.link]: {
            ...prev[article.link],
            loading: false
            // Don't set an error here, let the error come from the event data
          }
        }));
      };

      eventSource.addEventListener('complete', () => {
        eventSource.close();
        clearTimeout(connectionTimeout);

        setArticleConfigs(prev => ({
          ...prev,
          [article.link]: {
            ...prev[article.link],
            loading: false
          }
        }));
      });

      return () => {
        clearTimeout(connectionTimeout);
        eventSource.close();
      };

    } catch (error) {
      console.error('Error setting up EventSource:', error);
      setArticleConfigs(prev => ({
        ...prev,
        [article.link]: {
          ...prev[article.link],
          loading: false,
          error: 'Failed to initialize connection to backend service.'
        }
      }));
    }
  };

  const getArticleStatus = useCallback((article: Article) => {
    const config = articleConfigs[article.link];
    if (!config) return null;

    const { data, loading, error: configError } = config;
    const latestData = data[data.length - 1];
    const isCompleted = data.some(d => d.title === '结束' && d.status === 'completed');

    // Find the error data or success data regardless of completion status
    const errorData = data.find(d => d.status === 'failed');
    const successData = data.find(d => d.status === 'succeeded');

    // Final data is either the error data or the success data
    const finalData = errorData || (isCompleted ? successData : null);

    // We have an error if we have config error or a failed status message
    const hasError = configError !== null || errorData !== undefined;

    return {
      loading,
      latestData,
      isCompleted,
      finalData: finalData as StreamData | null,
      allData: data,
      hasError,
      configError,
      errorData
    };
  }, [articleConfigs]);

  const getFinalData = (article: Article) => {
    const status = getArticleStatus(article);
    return status?.finalData?.outputs;
  };

  const getSelectedTitle = (article: Article) => {
    const status = getArticleStatus(article);
    return status?.finalData?.selectedTitle;
  };

  const getStatusColor = (article: Article) => {
    const status = getArticleStatus(article);
    if (!status) return 'bg-gray-300';

    if (status.hasError) return 'bg-red-500';
    if (!status.isCompleted) return status.loading ? 'bg-blue-500' : 'bg-gray-300';
    return status.finalData?.status === 'succeeded' ? 'bg-green-500' : 'bg-red-500';
  };

  const getFinalError = (article: Article) => {
    const status = getArticleStatus(article);
    if (!status) return null;

    // First check for configuration errors
    if (status.configError) {
      return status.configError;
    }

    // If no final data, we can't extract specific error
    if (!status.finalData) return null;

    // If there's an error message directly in the finalData, return that
    if (status.finalData.error) {
      return status.finalData.error;
    }

    // Otherwise check for errors in the outputs
    return status.finalData.outputs?.error || null;
  };

  const getStatusText = (article: Article) => {
    const status = getArticleStatus(article);
    if (!status) return 'Waiting to start';

    if (status.hasError) return 'Error occurred';
    if (status.loading) return 'Processing...';
    if (status.isCompleted) return 'Completed';
    return status.latestData?.status || 'Waiting to start';
  };

  const handleContextUpdate = () => {
    const article = articles.find(a => a.link === editingTitleIndex?.articleLink);
    if (!article || editingContext === null) return;

    setArticleConfigs(prev => ({
      ...prev,
      [article.link]: {
        ...prev[article.link],
        data: prev[article.link].data.map(d =>
          d.status === 'succeeded' ? {
            ...d,
            outputs: { ...d.outputs, context: editingContext }
          } : d
        )
      }
    }));
    setEditingContext(null);
  };

  const handleTitleUpdate = () => {
    if (!editingTitleIndex) return;
    setEditingTitleIndex(null);
  };

  const handleTitleSelect = (article: Article, title: string) => {
    setArticleConfigs(prev => ({
      ...prev,
      [article.link]: {
        ...prev[article.link],
        data: prev[article.link].data.map(d =>
          d.status === 'succeeded' ? { ...d, selectedTitle: title } : d
        )
      }
    }));
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
                    {getStatusText(article)}
                  </span>
                  {getArticleStatus(article)?.latestData?.title &&
                   !getArticleStatus(article)?.isCompleted &&
                   !getArticleStatus(article)?.hasError && (
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
                  {getFinalData(article) && (
                    <div className="bg-white rounded-lg border p-4 space-y-6">
                      {getFinalData(article)?.context && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-700">口播稿</h4>
                          <div
                            ref={contextRef}
                            className="relative"
                            onClick={() => {
                              const context = getFinalData(article)?.context || '';
                              setEditingContext(context);
                            }}
                          >
                            <div className="w-full p-4 bg-gray-50 rounded-lg text-gray-600">
                              <div className={`whitespace-pre-wrap ${editingContext !== null ? 'invisible' : ''}`}>
                                {getFinalData(article)?.context}
                              </div>
                              {editingContext !== null && (
                                <textarea
                                  className="absolute inset-0 w-full h-full p-4 bg-transparent border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none rounded-lg"
                                  value={editingContext}
                                  onChange={(e) => setEditingContext(e.target.value)}
                                  autoFocus
                                  style={{
                                    overflowY: 'auto'
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {getFinalData(article)?.title_list?.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-700">待选标题</h4>
                          <div ref={titleRef} className="space-y-2">
                            {getFinalData(article)?.title_list?.map((title, index) => (
                              <div
                                key={index}
                                className={`group flex items-center justify-between p-3 rounded-lg text-gray-600 cursor-pointer transition-colors ${
                                  title === getSelectedTitle(article)
                                    ? 'bg-blue-50 border-2 border-blue-500'
                                    : 'bg-gray-50 hover:bg-gray-100'
                                }`}
                              >
                                {editingTitleIndex?.articleLink === article.link &&
                                 editingTitleIndex.index === index ? (
                                  <input
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-gray-600"
                                    value={title}
                                    onChange={(e) => {
                                      const newTitles = [...(getFinalData(article)?.title_list || [])];
                                      newTitles[index] = e.target.value;
                                      setArticleConfigs(prev => ({
                                        ...prev,
                                        [article.link]: {
                                          ...prev[article.link],
                                          data: prev[article.link].data.map(d =>
                                            d.status === 'succeeded' ? {
                                              ...d,
                                              outputs: { ...d.outputs, title_list: newTitles }
                                            } : d
                                          )
                                        }
                                      }));
                                    }}
                                    autoFocus
                                  />
                                ) : (
                                  <>
                                    <div
                                      className="flex-1"
                                      onClick={() => handleTitleSelect(article, title)}
                                    >
                                      {title}
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingTitleIndex({ articleLink: article.link, index });
                                      }}
                                      className="opacity-0 group-hover:opacity-100 ml-2 p-1 hover:bg-gray-200 rounded transition-opacity"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                      </svg>
                                    </button>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-700">背景图关键字</h4>
                        <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-gray-50 rounded-lg">
                          {(getFinalData(article)?.keywords?.length ?? 0) > 0 ? (
                            getFinalData(article)?.keywords?.map((keyword, index) => (
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

                  {((getArticleStatus(article)?.hasError) &&
                    (getFinalError(article) || articleConfigs[article.link]?.error)) ? (
                    <>
                      {console.log('Error to display:', getFinalError(article) || articleConfigs[article.link]?.error)}
                      <ErrorDisplay
                        message={getFinalError(article) || articleConfigs[article.link]?.error || 'Unknown error occurred'}
                        onRetry={() => handleGetConfig(article)}
                        title="处理失败"
                      />
                    </>
                  ) : null}

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
