import { ArticleBox } from '../../components/ArticleBox'
import { useEventSource } from '../../hooks/useEventSource'
import { Article } from '../../types/article'
import { API_BASE_URL } from '../../config'

interface ArticleListPageProps {
  rssIndex: number
  rssSource: {
    index: number
    name: string
    url: string
  }
}

export function ArticleListPage({ rssIndex }: ArticleListPageProps) {
  const { data: articles, loading, error } = useEventSource<Article>(
    `${API_BASE_URL}/gen_video/rss_content?index=${rssIndex}`
  )

  return (
    <div>
      <ArticleBox articles={articles} loading={loading} />
    </div>
  )
}
