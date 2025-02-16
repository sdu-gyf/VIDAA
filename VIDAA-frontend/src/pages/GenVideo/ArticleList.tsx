import { ArticleBox } from '../../components/article/ArticleBox'
import { useEventSource } from '../../hooks/useEventSource'
import { Article } from '../../types/article'
import { getApiUrl } from '../../constants/api'

interface ArticleListPageProps {
  rssIndex: number
  rssSource: {
    index: number
    name: string
    url: string
  }
  selectedArticles?: Article[]
  onArticleSelect?: (article: Article, selected: boolean) => void
}

export function ArticleListPage({
  rssIndex,
  selectedArticles,
  onArticleSelect
}: ArticleListPageProps) {
  const { data: articles, loading, error } = useEventSource<Article>(
    getApiUrl('RSS_CONTENT', { index: rssIndex })
  )

  return (
    <div>
      <ArticleBox
        articles={articles}
        loading={loading}
        selectedArticles={selectedArticles}
        onArticleSelect={onArticleSelect}
      />
    </div>
  )
}
