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

export function ArticleListPage({ rssIndex, rssSource }: ArticleListPageProps) {
  const { data: articles, loading, error } = useEventSource<Article>(
    `${API_BASE_URL}/gen_video/rss_content?index=${rssIndex}`
  )

  return (
    <div>
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-xl font-semibold mb-2">{rssSource.name}</h2>
        <p className="text-gray-600">
          <span className="font-medium">URL:</span>{' '}
          <a
            href={rssSource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline break-all"
          >
            {rssSource.url}
          </a>
        </p>
      </div>

      {error ? (
        <div className="text-center text-red-600 py-4">
          Error: {error}
        </div>
      ) : (
        <ArticleBox articles={articles} loading={loading} />
      )}
    </div>
  )
}
