import { useState, useEffect, useMemo } from 'react'
import { API_BASE_URL } from '../config'

interface RSSSource {
  index: number
  name: string
  url: string
}

interface RSSListProps {
  onSelect: (source: RSSSource | null) => void
  onConfirm: () => void
  selectedIndex?: number
  displayMode?: 'tabs' | 'list'
}

// 创建一个缓存对象来存储 RSS 源数据
const rssSourcesCache: {
  data: RSSSource[] | null
  timestamp: number | null
} = {
  data: null,
  timestamp: null
}

export function RSSList({ onSelect, onConfirm, selectedIndex, displayMode = 'list' }: RSSListProps) {
  const [rssSources, setRssSources] = useState<RSSSource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 使用 useMemo 来缓存获取数据的函数
  const fetchRSSSources = useMemo(() => async () => {
    // 如果缓存存在且未过期（这里设置 5 分钟过期），直接使用缓存
    if (rssSourcesCache.data && rssSourcesCache.timestamp &&
        Date.now() - rssSourcesCache.timestamp < 5 * 60 * 1000) {
      setRssSources(rssSourcesCache.data)
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/gen_video/rss_list`)
      if (!response.ok) {
        throw new Error('Failed to fetch RSS sources')
      }
      const data = await response.json()

      // 更新缓存
      rssSourcesCache.data = data
      rssSourcesCache.timestamp = Date.now()

      setRssSources(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRSSSources()
  }, [fetchRSSSources])

  const handleSourceClick = (source: RSSSource) => {
    if (selectedIndex === source.index) {
      onSelect(null)
    } else {
      onSelect(source)
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading RSS sources...</div>
  }

  if (error) {
    return <div className="text-red-600 py-4">Error: {error}</div>
  }

  if (displayMode === 'tabs') {
    return (
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {rssSources.map((source) => (
            <button
              key={source.index}
              onClick={() => handleSourceClick(source)}
              className={`
                whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                ${selectedIndex === source.index
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {source.name}
            </button>
          ))}
        </nav>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">RSS Sources</h2>
        <div className="space-y-4">
          {rssSources.map((source) => (
            <div
              key={source.index}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedIndex === source.index
                  ? 'border-blue-500 bg-blue-50'
                  : 'hover:border-blue-500'
              }`}
              onClick={() => handleSourceClick(source)}
            >
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                {source.name}
              </h3>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                onClick={(e) => e.stopPropagation()}
              >
                {source.url}
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={onConfirm}
          disabled={selectedIndex === undefined}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            selectedIndex !== undefined
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue to Select Articles
        </button>
      </div>
    </div>
  )
}
