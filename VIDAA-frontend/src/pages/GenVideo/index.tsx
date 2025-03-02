import { ArticleListPage } from './ArticleList'
import { ComingSoonPage } from '../ComingSoon'
import { RSSList } from '../../components/rss/RSSList'
import { Button } from '@heroui/react'
import { useVideoGeneration } from '../../hooks/useVideoGeneration'
import { useRSSSources } from '../../hooks/useRSSSources'
import { useEffect } from 'react'
import { VideoConfigList } from '../../components/video/VideoConfigList'

export function GenVideoPage() {
  const {
    state: { currentStep, selectedRSS, selectedArticles },
    steps,
    handleRSSSelect,
    handleArticleSelect,
    setCurrentStep
  } = useVideoGeneration()

  const { rssSources, loading: rssSourcesLoading } = useRSSSources()

  useEffect(() => {
    if (!selectedRSS && !rssSourcesLoading && rssSources.length > 0) {
      handleRSSSelect(rssSources[0])
    }
  }, [rssSourcesLoading, rssSources, selectedRSS, handleRSSSelect])

  const renderStepContent = (stepId: string) => {
    switch (stepId) {
      case 'articles':
        return (
          <div className="space-y-6">
            {/* RSS Sources Tabs */}
            <div className="border-b border-gray-200">
              <RSSList
                onSelect={handleRSSSelect}
                selectedIndex={selectedRSS?.index}
                displayMode="tabs"
              />
            </div>

            {/* Articles List */}
            {selectedRSS ? (
              <>
                <ArticleListPage
                  rssIndex={selectedRSS.index}
                  rssSource={selectedRSS}
                  selectedArticles={selectedArticles}
                  onArticleSelect={handleArticleSelect}
                />
                {selectedArticles.length > 0 && (
                  <div className="fixed bottom-8 right-8 z-10">
                    <Button
                      color="primary"
                      size="lg"
                      onPress={() => setCurrentStep('generate')}
                      className="shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 rounded-full px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-500"
                      endContent={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-5 h-5 ml-2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                          />
                        </svg>
                      }
                    >
                      Next Step • {selectedArticles.length} Selected
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Please select an RSS source to view articles
              </div>
            )}
          </div>
        )
      case 'generate':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Video Configuration ({selectedArticles.length} articles)
              </h2>
              <VideoConfigList articles={selectedArticles} />
            </div>
          </div>
        )
      default:
        return <ComingSoonPage />
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left Sidebar - Steps */}
      <div className="w-80 min-w-80 border-r bg-gray-50 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Progress</h2>
        <nav aria-label="Progress">
          <ol className="space-y-4">
            {steps.map((step) => (
              <li key={step.id}>
                <button
                  onClick={() => step.enabled && setCurrentStep(step.id)}
                  className={`w-full text-left group flex flex-col border rounded-lg py-4 px-6 hover:border-blue-500 ${
                    currentStep === step.id
                      ? "border-blue-500 bg-white shadow-sm"
                      : step.enabled
                      ? "border-gray-200 bg-white hover:bg-gray-50"
                      : "border-gray-200 bg-gray-100 cursor-not-allowed opacity-60"
                  }`}
                >
                  <div className="flex items-center">
                    <span className={`
                      flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full
                      text-sm font-medium mr-3
                      ${currentStep === step.id
                        ? "bg-blue-500 text-white"
                        : step.enabled
                          ? "bg-gray-200 text-gray-600"
                          : "bg-gray-300 text-gray-500"
                      }
                    `}>
                      {step.number}
                    </span>
                    <div>
                      <span className="block text-sm font-semibold text-gray-900">
                        {step.title}
                      </span>
                      <span className="block text-sm text-gray-500 mt-1">
                        {step.description}
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 p-8">
        {renderStepContent(currentStep)}
      </div>
    </div>
  )
}
