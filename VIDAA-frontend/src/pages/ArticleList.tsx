import { ArticleBox } from '../components/ArticleBox'
import { useEventSource } from '../hooks/useEventSource'
import { Article } from '../types/article'
import { API_BASE_URL } from '../config'

export function ArticleListPage() {
  const { data: articles, loading, error } = useEventSource<Article>(
    `${API_BASE_URL}/gen_video/rss_content?index=0`
  )

  if (error) {
    return (
      <div className="text-center text-red-600 py-4">
        Error: {error}
      </div>
    )
  }

  return (
    <div>
      <ArticleBox articles={articles} loading={loading} />
    </div>
  )
}
