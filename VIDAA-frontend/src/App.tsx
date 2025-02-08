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
        <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          {messages.length === 0 ? (
            <div>{loading ? 'loading...' : 'no message'}</div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    margin: '15px 0',
                    padding: '10px',
                    border: '1px solid #eee',
                    borderRadius: '4px'
                  }}
                >
                  <h3 style={{ margin: '0 0 8px 0' }}>{msg.title}</h3>
                  <a
                    href={msg.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#1890ff',
                      textDecoration: 'none',
                      display: 'block',
                      marginBottom: '8px'
                    }}
                  >
                    {msg.link}
                  </a>
                  <div style={{
                    color: '#666',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}>
                    {expandedIds.has(index) ? msg.content : truncateText(msg.content)}
                    <div
                      onClick={() => toggleExpand(index)}
                      style={{
                        color: '#1890ff',
                        cursor: 'pointer',
                        marginTop: '8px',
                        textAlign: 'right',
                        fontSize: '13px'
                      }}
                    >
                      {expandedIds.has(index) ? 'collapse' : 'expand'}
                    </div>
                  </div>
                </div>
              ))}
              {loading && <div style={{ textAlign: 'center', padding: '10px' }}>loading more...</div>}
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default App
