import './App.css'
import { useState, useEffect } from 'react'
import { API_BASE_URL } from './config'

interface Message {
  title: string;
  link: string;
  content: string;
  type?: string;
  error?: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())  // 追踪展开状态

  useEffect(() => {
    console.log('start connect SSE...')
    const eventSource = new EventSource(`${API_BASE_URL}/gen_video/rss_content?index=0`)

    eventSource.onopen = () => {
      setLoading(true)
    }

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === 'complete') {
        setLoading(false)
        eventSource.close()
        return
      }

      if (data.type === 'error') {
        setLoading(false)
        eventSource.close()
        return
      }

      setMessages(prev => [...prev, data])
    }

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error)
      setLoading(false)
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [])

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  }

  const toggleExpand = (index: number) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  return (
    <>
      <div>
        <h1>VIDAA</h1>
        <div className="message-container">
          {messages.length === 0 ? (
            <div>{loading ? 'loading...' : 'no message'}</div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className="message-card"
                >
                  <h3 className="message-title">{msg.title}</h3>
                  <a
                    href={msg.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="message-link"
                  >
                    {msg.link}
                  </a>
                  <div className="message-content">
                    {expandedIds.has(index) ? msg.content : truncateText(msg.content)}
                    <div
                      onClick={() => toggleExpand(index)}
                      className="toggle-expand"
                    >
                      {expandedIds.has(index) ? 'collapse' : 'expand'}
                    </div>
                  </div>
                </div>
              ))}
              {loading && <div className="loading-more">loading more...</div>}
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default App
