export const API_BASE_URL = "http://127.0.0.1:8000";
export const API_PATHS = {
  RSS_LIST: '/gen_video/rss_list',
  RSS_CONTENT: '/gen_video/rss_content',
  DIFY: '/gen_video/dify',
  IMAGES: '/gen_video/images',
  PACK_VIDEO: '/gen_video/pack_video',
  GEN_VIDEO_TTS: '/gen_video/tts',
} as const;

export const getApiUrl = (path: keyof typeof API_PATHS, params?: Record<string, string>) => {
  const url = new URL(API_BASE_URL + API_PATHS[path])
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }
  return url.toString()
}
