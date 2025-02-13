import { useState } from 'react'
import { ArticleListPage } from './ArticleList'
import { ComingSoonPage } from '../ComingSoon'
import { RSSList } from '../../components/RSSList'

interface RSSSource {
  index: number
  name: string
  url: string
}

const steps = [
  {
    number: 1,
    title: "RSS Sources",
    description: "Configure and manage RSS feed sources",
    id: "rss",
    enabled: true
  },
  {
    number: 2,
    title: "Select Articles",
    description: "Choose articles to generate video from",
    id: "articles",
    enabled: true
  },
  {
    number: 3,
    title: "Video Settings",
    description: "Customize video generation settings",
    id: "settings",
    enabled: false
  },
  {
    number: 4,
    title: "Generate",
    description: "Start video generation process",
    id: "generate",
    enabled: false
  }
]

export function GenVideoPage() {
  const [currentStep, setCurrentStep] = useState(steps[0].id)
  const [selectedRSS, setSelectedRSS] = useState<RSSSource | null>(null)

  const handleRSSSelect = (source: RSSSource) => {
    setSelectedRSS(source)
  }

  const handleRSSConfirm = () => {
    setCurrentStep(steps[1].id)
  }

  const renderStepContent = (stepId: string) => {
    switch (stepId) {
      case 'rss':
        return (
          <RSSList
            onSelect={handleRSSSelect}
            onConfirm={handleRSSConfirm}
            selectedIndex={selectedRSS?.index}
          />
        )
      case 'articles':
        return selectedRSS ? (
          <ArticleListPage
            rssIndex={selectedRSS.index}
            rssSource={selectedRSS}
          />
        ) : null
      default:
        return <ComingSoonPage />
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="py-8">
        <nav aria-label="Progress">
          <ol className="space-y-4 md:flex md:space-y-0 md:space-x-8">
            {steps.map((step) => (
              <li key={step.id} className="md:flex-1">
                <button
                  onClick={() => step.enabled && setCurrentStep(step.id)}
                  className={`group flex flex-col border rounded-lg py-4 px-6 hover:border-blue-500 w-full ${
                    currentStep === step.id
                      ? "border-blue-500 bg-blue-50"
                      : step.enabled
                      ? "border-gray-200 hover:bg-gray-50"
                      : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                  }`}
                >
                  <span className="text-xs font-semibold tracking-wide uppercase">
                    Step {step.number}
                  </span>
                  <span className="text-lg font-medium">{step.title}</span>
                  <span className="mt-1 text-sm text-gray-500">
                    {step.description}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-8">
          {renderStepContent(currentStep)}
        </div>
      </div>
    </div>
  )
}
