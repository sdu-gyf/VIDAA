import { useState, useEffect, useCallback, useRef } from 'react';
import { Article } from '../../types/article';
import { Button } from '@heroui/react';
import { getApiUrl } from '../../constants/api';
import { useVideoConfig } from '../../contexts/VideoConfigContext';
import { useClickAway } from 'react-use';
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

interface ImagePreviewProps {
  keyword: string | null;
  position: { x: number; y: number };
}

// 添加防抖函数
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };
}


function calculateRecommendedImages(characterCount: number): number {
  // Calculate recommended number of images based on character count
  const characterPerMinute = 350;
  const minutes = characterCount / characterPerMinute;
  const seconds = minutes * 60;
  return Math.ceil(seconds / 5) + 5;
}

export function VideoConfigList({ articles }: VideoConfigListProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const { articleConfigs, setArticleConfigs } = useVideoConfig();

  const [editingContext, setEditingContext] = useState<string | null>(null);
  const [editingTitleIndex, setEditingTitleIndex] = useState<{articleLink: string, index: number} | null>(null);

  // Add state for selected keywords and image pool
  const [selectedKeywords, setSelectedKeywords] = useState<{[articleLink: string]: string[]}>({});
  const [imagePool, setImagePool] = useState<{[articleLink: string]: {keyword: string, url: string}[]}>({});

  // Add drag and drop state
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const [currentArticleLink, setCurrentArticleLink] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Add collapsed state for image pools
  const [collapsedImagePools, setCollapsedImagePools] = useState<{[articleLink: string]: boolean}>({});

  // Image preview states
  const [previewKeyword, setPreviewKeyword] = useState<string | null>(null);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Add cache for keyword images
  const [keywordImageCache, setKeywordImageCache] = useState<{[keyword: string]: string[]}>({});

  const contextRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  const lastRequestedKeywordRef = useRef<string | null>(null);

  const [isShowingPreview, setIsShowingPreview] = useState(false);

  // Add video generation states
  const [generatingVideoArticleLink, setGeneratingVideoArticleLink] = useState<string | null>(null);
  const [videoGenerationProgress, setVideoGenerationProgress] = useState<{[articleLink: string]: string}>({});
  const [videoGenerationError, setVideoGenerationError] = useState<{[articleLink: string]: string}>({});
  const [videoGenerationComplete, setVideoGenerationComplete] = useState<{[articleLink: string]: boolean}>({});
  const [videoDownloadUrls, setVideoDownloadUrls] = useState<{[articleLink: string]: string}>({});

  const mousePositionRef = useRef({ x: 0, y: 0 });

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

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      // Cleanup all object URLs when component unmounts
      Object.values(videoDownloadUrls).forEach(url => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [videoDownloadUrls]);

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

    // Otherwise check if there's an error in the outputs
    return null;
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

  const handleKeywordHover = useCallback(
    debounce(async (keyword: string, event: React.MouseEvent) => {
      mousePositionRef.current = { x: event.clientX, y: event.clientY };
      mousePositionRef.current = { x: event.clientX, y: event.clientY };

      setPreviewKeyword(keyword);
      setPreviewPosition(mousePositionRef.current);
      setIsShowingPreview(true);

      // Check if images for this keyword are already cached
      if (keywordImageCache[keyword] && keywordImageCache[keyword].length > 0) {
        console.log(`Using cached images for keyword: ${keyword}`);
        setPreviewImages(keywordImageCache[keyword]);
        return;
      }

      // If not cached, fetch from backend
      setIsLoadingImages(true);
      setImageError(null);
      setPreviewImages([]);

      try {
        const url = getApiUrl('IMAGES', {
          query: keyword,
          num: '3',
          page: '1'
        });
        console.log(`Fetching images for keyword: ${keyword}`);
        const response = await fetch(url);
        const data = await response.json();

        let imageUrls: string[] = [];

        if (data.images && Array.isArray(data.images)) {
          console.log("Found images array in response:", data.images);
          imageUrls = data.images.filter((img: any) => img && typeof img === 'string' && img.trim() !== '');
        } else if (data.data && Array.isArray(data.data)) {
          console.log("Found data array in response:", data.data);
          imageUrls = data.data.filter((img: any) => img && typeof img === 'string' && img.trim() !== '');
        } else if (Array.isArray(data)) {
          console.log("Response is directly an array:", data);
          imageUrls = data.filter((img: any) => img && typeof img === 'string' && img.trim() !== '');
        }

        console.log(`Found ${imageUrls.length} valid image URLs for keyword "${keyword}"`, imageUrls);

        // Update cache with the fetched images
        setKeywordImageCache(prevCache => ({
          ...prevCache,
          [keyword]: imageUrls
        }));

        setPreviewImages(imageUrls);
      } catch (error) {
        console.error(`Error fetching images for keyword "${keyword}":`, error);
        setImageError('Failed to load images');
      } finally {
        setIsLoadingImages(false);
      }
    }, 300),
    [setPreviewKeyword, setPreviewPosition, setIsLoadingImages, setImageError, setPreviewImages, setIsShowingPreview, keywordImageCache]
  );

  const handleKeywordLeave = () => {
    setIsShowingPreview(false);
  };

  // Add function to handle keyword selection
  const handleKeywordSelect = (article: Article, keyword: string) => {
    console.log(`Selected keyword: ${keyword} for article: ${article.link}`);

    setSelectedKeywords(prev => {
      const articleKeywords = prev[article.link] || [];

      // Toggle selection
      if (articleKeywords.includes(keyword)) {
        // Remove keyword if already selected
        const newKeywords = articleKeywords.filter(k => k !== keyword);
        // Remove images with this keyword from the pool
        setImagePool(prevPool => ({
          ...prevPool,
          [article.link]: (prevPool[article.link] || []).filter(img => img.keyword !== keyword)
        }));
        return { ...prev, [article.link]: newKeywords };
      } else {
        // Add keyword if not selected
        const newKeywords = [...articleKeywords, keyword];

        // Fetch images for this keyword
        fetchImagesForKeyword(article.link, keyword);

        return { ...prev, [article.link]: newKeywords };
      }
    });
  };

  // Function to fetch images for a keyword and add to pool
  const fetchImagesForKeyword = async (articleLink: string, keyword: string) => {
    try {
      setIsLoadingImages(true);
      setImageError(null);

      // Check if images for this keyword are already cached
      if (keywordImageCache[keyword] && keywordImageCache[keyword].length > 0) {
        console.log(`Using cached images for keyword: ${keyword}`);
        addImagesToPool(articleLink, keyword, keywordImageCache[keyword]);
        setIsLoadingImages(false);
        return;
      }

      const url = getApiUrl('IMAGES', {
        query: keyword,
        num: '3',
        page: '1'
      });

      const response = await fetch(url);
      const data = await response.json();

      let imageUrls: string[] = [];

      if (data.images && Array.isArray(data.images)) {
        imageUrls = data.images.filter((img: any) => img && typeof img === 'string' && img.trim() !== '');
      } else if (data.data && Array.isArray(data.data)) {
        imageUrls = data.data.filter((img: any) => img && typeof img === 'string' && img.trim() !== '');
      } else if (Array.isArray(data)) {
        imageUrls = data.filter((img: any) => img && typeof img === 'string' && img.trim() !== '');
      }

      // Update cache with the fetched images
      setKeywordImageCache(prevCache => ({
        ...prevCache,
        [keyword]: imageUrls
      }));

      addImagesToPool(articleLink, keyword, imageUrls);
    } catch (error) {
      console.error(`Error fetching images for keyword "${keyword}":`, error);
      setImageError('Failed to load images');
    } finally {
      setIsLoadingImages(false);
    }
  };

  // Function to add images to the pool
  const addImagesToPool = (articleLink: string, keyword: string, imageUrls: string[]) => {
    setImagePool(prev => {
      const articleImages = prev[articleLink] || [];
      // First remove any existing images with this keyword
      const filteredImages = articleImages.filter(img => img.keyword !== keyword);
      const newImages = imageUrls.map(url => ({ keyword, url }));

      return {
        ...prev,
        [articleLink]: [...filteredImages, ...newImages]
      };
    });
  };

  // Function to remove an image from the pool
  const removeImageFromPool = (articleLink: string, index: number) => {
    setImagePool(prev => {
      const articleImages = [...(prev[articleLink] || [])];
      articleImages.splice(index, 1);

      return {
        ...prev,
        [articleLink]: articleImages
      };
    });
  };

  // Add drag and drop handlers
  const handleDragStart = (articleLink: string, index: number, e: React.DragEvent) => {
    setDraggedImageIndex(index);
    setCurrentArticleLink(articleLink);
    setIsDragging(true);

    // For better drag image
    if (e.dataTransfer && e.target instanceof HTMLElement) {
      e.dataTransfer.effectAllowed = 'move';

      // Set the drag image to be the actual image element for better UX
      const imageElement = e.currentTarget.querySelector('img');
      if (imageElement) {
        const rect = imageElement.getBoundingClientRect();
        e.dataTransfer.setDragImage(
          imageElement,
          rect.width / 2,
          rect.height / 2
        );
      }

      // Add a class to the body to enable specific styling during drag
      document.body.classList.add('dragging-active');
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (articleLink: string, dropIndex: number, e: React.DragEvent) => {
    e.preventDefault();

    if (draggedImageIndex === null || currentArticleLink !== articleLink) return;

    // Reorder the images
    setImagePool(prev => {
      const articleImages = [...(prev[articleLink] || [])];
      const [draggedImage] = articleImages.splice(draggedImageIndex, 1);
      articleImages.splice(dropIndex, 0, draggedImage);

      return {
        ...prev,
        [articleLink]: articleImages
      };
    });

    // Reset drag state
    setDraggedImageIndex(null);
    setCurrentArticleLink(null);
    setIsDragging(false);
  };

  const handleDragEnd = () => {
    setDraggedImageIndex(null);
    setCurrentArticleLink(null);
    setIsDragging(false);

    // Remove the class from body
    document.body.classList.remove('dragging-active');
  };

  // Toggle image pool collapse state
  const toggleImagePoolCollapse = (articleLink: string) => {
    setCollapsedImagePools(prev => ({
      ...prev,
      [articleLink]: !prev[articleLink]
    }));
  };

  // Handle video generation
  const handleGenerateVideo = async (article: Article) => {
    if (!article || !article.link) return;

    // Get the article script content
    const articleContent = getFinalData(article)?.context;
    if (!articleContent) {
      setVideoGenerationError(prev => ({
        ...prev,
        [article.link]: "No article content available"
      }));
      return;
    }

    // Get images from the pool
    const images = imagePool[article.link]?.map(img => img.url) || [];
    if (images.length === 0) {
      setVideoGenerationError(prev => ({
        ...prev,
        [article.link]: "No images available in the pool"
      }));
      return;
    }

    try {
      // Reset states for this article
      setGeneratingVideoArticleLink(article.link);
      setVideoGenerationProgress(prev => ({ ...prev, [article.link]: "Starting video generation..." }));
      setVideoGenerationError(prev => ({ ...prev, [article.link]: "" }));
      setVideoGenerationComplete(prev => ({ ...prev, [article.link]: false }));
      setVideoDownloadUrls(prev => ({ ...prev, [article.link]: "" }));

      // Make request to generate video using the API utility
      const apiUrl = getApiUrl('PACK_VIDEO');
      console.log(`Making request to: ${apiUrl}`, {
        article: articleContent.substring(0, 100) + '...',  // Log truncated content for readability
        imageCount: images.length
      });

      setVideoGenerationProgress(prev => ({
        ...prev,
        [article.link]: "Sending request to generate video..."
      }));

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          article: articleContent,
          images: images
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to get error details');
        console.error(`API error (${response.status}):`, errorText);
        throw new Error(`Server responded with ${response.status}: ${response.statusText || errorText}`);
      }

      setVideoGenerationProgress(prev => ({
        ...prev,
        [article.link]: "Processing video file..."
      }));

      // This is a video file response - handle as a download
      console.log('Received video file response');

      // Create a blob from the response
      const blob = await response.blob();

      // Create a URL for the blob and set it for download
      const url = URL.createObjectURL(blob);
      setVideoDownloadUrls(prev => ({ ...prev, [article.link]: url }));

      // Mark generation as complete
      setVideoGenerationComplete(prev => ({ ...prev, [article.link]: true }));
      setVideoGenerationProgress(prev => ({ ...prev, [article.link]: "Video generated successfully!" }));
      setGeneratingVideoArticleLink(null);

    } catch (error) {
      console.error("Error generating video:", error);

      // Determine the appropriate error message
      let errorMessage = "Unknown error occurred during video generation";

      if (error instanceof Error) {
        errorMessage = error.message;

        // Check for network errors
        if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
          errorMessage = "Network error: Could not connect to the server. Please check your connection.";
        }
        // Check for timeout errors
        else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
          errorMessage = "Request timed out. The server took too long to respond.";
        }
        // Check for server errors
        else if (error.message.includes('5') && error.message.includes('Server responded with')) {
          errorMessage = "Server error: The video generation service is experiencing issues. Please try again later.";
        }
      }

      setVideoGenerationError(prev => ({
        ...prev,
        [article.link]: errorMessage
      }));
      setGeneratingVideoArticleLink(null);
    }
  };

  // Add TTS function before the return statement
  const handleTTS = async (article: Article) => {
    if (!article || !article.link) return;

    // Get the article script content
    const articleContent = getFinalData(article)?.context;
    const firstTitle = getFinalData(article)?.title_list?.[0];

    if (!articleContent) {
      setVideoGenerationError(prev => ({
        ...prev,
        [article.link]: "No article content available"
      }));
      return;
    }

    try {
      const apiUrl = getApiUrl('GEN_VIDEO_TTS');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: articleContent,
          filename: firstTitle || 'tts'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate TTS');
      }

      // Create a blob from the response and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${firstTitle || 'tts'}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error generating TTS:', error);
      setVideoGenerationError(prev => ({
        ...prev,
        [article.link]: "Failed to generate TTS"
      }));
    }
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
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium text-gray-700">口播稿</h4>
                            <div className="bg-gray-100 px-3 py-1 rounded-md text-sm text-gray-600 font-mono">
                              {(() => {
                                const characterCount = getFinalData(article)?.context?.length || 0;
                                const recommendedImages = calculateRecommendedImages(characterCount);
                                return `口播稿共${characterCount}字，推荐选择${recommendedImages}张图片作为背景图`;
                              })()}
                            </div>
                          </div>
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

                      {/* Title List */}
                      {(() => {
                        const titleList = getFinalData(article)?.title_list;
                        if (!titleList || titleList.length === 0) return null;

                        return (
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-700">待选标题</h4>
                            <div ref={titleRef} className="space-y-2">
                              {titleList.map((title, index) => (
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
                                        const newTitles = [...titleList];
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
                        );
                      })()}

                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-700">背景图关键字</h4>
                        <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-gray-50 rounded-lg">
                          {(getFinalData(article)?.keywords?.length ?? 0) > 0 ? (
                            getFinalData(article)?.keywords?.map((keyword, index) => {
                              const isSelected = (selectedKeywords[article.link] || []).includes(keyword);
                              return (
                                <span
                                  key={index}
                                  className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                                    isSelected
                                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                  onClick={() => handleKeywordSelect(article, keyword)}
                                  onMouseEnter={(e) => {
                                    if (!isShowingPreview || lastRequestedKeywordRef.current !== keyword) {
                                      handleKeywordHover(keyword, e);
                                    } else {
                                      mousePositionRef.current = { x: e.clientX, y: e.clientY };
                                      setPreviewPosition(mousePositionRef.current);
                                    }
                                  }}
                                  onMouseLeave={handleKeywordLeave}
                                >
                                  {keyword}
                                </span>
                              );
                            })
                          ) : (
                            <div className="text-sm text-gray-400 w-full text-center">
                              No keywords available
                            </div>
                          )}
                        </div>

                        {/* Image Pool for Selected Keywords */}
                        {imagePool[article.link] && imagePool[article.link].length > 0 && (
                          <div className="mt-4 p-4 border rounded-lg bg-white">
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center">
                                <h4 className="font-medium text-gray-700">已选图片池 ({imagePool[article.link].length})</h4>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleImagePoolCollapse(article.link);
                                  }}
                                  className="ml-2 p-1 rounded-full hover:bg-gray-100"
                                >
                                  {collapsedImagePools[article.link] ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                              <span className="text-sm text-gray-500">拖动调整顺序 / 点击x删除图片</span>
                            </div>

                            {!collapsedImagePools[article.link] && (
                              <div className={`grid grid-cols-3 gap-4`}>
                                {imagePool[article.link].map((image, idx) => (
                                  <div
                                    key={`${image.keyword}-${idx}`}
                                    className={`
                                      relative group transition-all duration-200
                                      ${isDragging ?
                                        idx === draggedImageIndex && currentArticleLink === article.link
                                          ? 'opacity-60 scale-105 z-10'
                                          : 'hover:border-blue-300'
                                        : 'hover:shadow-md hover:scale-[1.02] cursor-grab active:cursor-grabbing'
                                      }
                                      ${isDragging && currentArticleLink === article.link && idx !== draggedImageIndex
                                        ? 'border-2 border-dashed border-gray-300 rounded'
                                        : ''
                                      }
                                    `}
                                    draggable={true}
                                    onDragStart={(e) => handleDragStart(article.link, idx, e)}
                                    onDragOver={(e) => handleDragOver(e, idx)}
                                    onDrop={(e) => handleDrop(article.link, idx, e)}
                                    onDragEnd={handleDragEnd}
                                  >
                                    <div className="absolute top-0 right-0 z-20">
                                      <button
                                        className="bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                        onClick={() => removeImageFromPool(article.link, idx)}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                      </button>
                                    </div>
                                    <div className="absolute top-1 left-1 z-20">
                                      <span className="text-xs px-2 py-0.5 bg-gray-800/70 text-white rounded-md shadow-sm">
                                        {image.keyword}
                                      </span>
                                    </div>
                                    <div className={`h-32 w-full overflow-hidden rounded-lg ${
                                      isDragging && currentArticleLink === article.link && idx === draggedImageIndex
                                        ? 'shadow-xl ring-2 ring-blue-400'
                                        : 'shadow-sm'
                                    }`}>
                                      <img
                                        src={image.url}
                                        alt={image.keyword}
                                        className={`h-32 w-full object-cover transition-transform duration-300 ${
                                          !isDragging ? 'group-hover:scale-105' : ''
                                        }`}
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Image+Load+Error';
                                        }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Generate Video Button */}
                  {getArticleStatus(article)?.finalData && !getArticleStatus(article)?.loading && (
                    <div className="mt-4 flex flex-col items-center">
                      {generatingVideoArticleLink === article.link ? (
                        <div className="flex flex-col items-center space-y-3 p-4 bg-gray-50 rounded-lg w-full">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-gray-700 font-medium">Generating Video</span>
                          </div>
                          <div className="text-sm text-gray-600 text-center">
                            {videoGenerationProgress[article.link] || "Processing..."}
                          </div>
                        </div>
                      ) : videoGenerationComplete[article.link] ? (
                        <div className="flex flex-col items-center space-y-3 p-4 bg-green-50 rounded-lg w-full">
                          <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-700 font-medium">Video Generated Successfully!</span>
                          </div>

                          {videoDownloadUrls[article.link] && (
                            <div className="mt-2 flex flex-col items-center gap-2">
                              <a
                                href={videoDownloadUrls[article.link]}
                                download={`${(getSelectedTitle(article) || article.title).replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-').substring(0, 30)}.mp4`}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-2 shadow-md"
                                onClick={() => {
                                  // Track download attempt
                                  console.log('Download initiated for article:', article.title);
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Download Video
                              </a>
                            </div>
                          )}
                        </div>
                      ) : videoGenerationError[article.link] ? (
                        <div className="flex flex-col items-center space-y-3 p-4 bg-red-50 rounded-lg w-full">
                          <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-700 font-medium">Error Generating Video</span>
                          </div>
                          <div className="text-sm text-red-600 text-center">
                            {videoGenerationError[article.link]}
                          </div>
                          <Button
                            color="primary"
                            size="md"
                            onClick={() => {
                              // Clear error and try again
                              setVideoGenerationError(prev => ({ ...prev, [article.link]: "" }));
                            }}
                            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            Try Again
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-4">
                          <Button
                            color="primary"
                            size="lg"
                            onClick={() => handleTTS(article)}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md"
                          >
                            Generate TTS
                          </Button>
                          <Button
                            color="primary"
                            size="lg"
                            onClick={() => handleGenerateVideo(article)}
                            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md"
                            isDisabled={!imagePool[article.link] || imagePool[article.link]?.length === 0}
                          >
                            {!imagePool[article.link] || imagePool[article.link]?.length === 0
                              ? "Add images first"
                              : "Generate Video"}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Error Display */}
                  {getArticleStatus(article)?.hasError && (getFinalError(article) || articleConfigs[article.link]?.error) && (
                    <div>
                      <ErrorDisplay
                        message={getFinalError(article) || articleConfigs[article.link]?.error || 'Unknown error occurred'}
                        onRetry={() => handleGetConfig(article)}
                        title="处理失败"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Image Preview Popup */}
      {isShowingPreview && previewKeyword && (
        <div
          className="fixed bg-white rounded-lg shadow-lg border overflow-hidden z-50 pointer-events-none"
          style={{
            top: Math.max(10, previewPosition.y - 250),
            left: previewPosition.x - 100,
            maxWidth: '400px'
          }}
        >
          <div className="p-2 bg-gray-50 border-b">
            <span className="font-medium text-sm text-gray-700">{previewKeyword}</span>
          </div>
          <div className="p-3">
            {isLoadingImages ? (
              <div className="flex justify-center items-center py-4">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : imageError ? (
              <div className="text-red-500 text-sm py-2">{imageError}</div>
            ) : previewImages.length === 0 ? (
              <div className="text-gray-500 text-sm py-2">No images found</div>
            ) : (
              <div className="flex flex-row gap-2 overflow-x-auto">
                {previewImages.map((image, idx) => (
                  <img
                    key={idx}
                    src={image}
                    alt={`${previewKeyword} ${idx+1}`}
                    className="h-[120px] w-auto rounded object-cover flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Image+Load+Error';
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
