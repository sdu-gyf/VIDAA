import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config'

interface RSSSource {
  index: number
  name: string
  url: string
}

interface RSSListProps {
  onSelect: (source: RSSSource) => void
  onConfirm: () => void
  selectedIndex?: number
}

export function RSSList({ onSelect, onConfirm, selectedIndex }: RSSListProps) {
  const [rssSources, setRssSources] = useState<RSSSource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRSSSources = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/gen_video/rss_list`)
        if (!response.ok) {
          throw new Error('Failed to fetch RSS sources')
        }
        const data = await response.json()
        setRssSources(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchRSSSources()
  }, [])

  if (loading) {
    return <div className="text-center py-4">Loading RSS sources...</div>
  }

  if (error) {
    return <div className="text-red-600 py-4">Error: {error}</div>
  }

  return (
    <div>
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
              onClick={() => onSelect(source)}
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

      {/* 确认按钮 */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={onConfirm}
          disabled={selectedIndex === undefined}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            selectedIndex !== undefined
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue to Select Articles
        </button>
      </div>
    </div>
  )
}
