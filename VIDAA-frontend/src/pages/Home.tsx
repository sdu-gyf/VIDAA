import { Link } from 'react-router-dom'
import { Button, Card, CardBody } from '@heroui/react'

export function HomePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
            Video Generation
            <span className="block text-blue-600">Made Simple</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Transform your articles into engaging videos automatically. Our AI-powered platform
            helps you create professional videos from your content in minutes.
          </p>
          <div className="mt-10 flex items-center justify-center">
            <Button
              as={Link}
              to="/gen-video"
              color="primary"
              size="lg"
              radius="full"
              className="bg-blue-600 text-white hover:bg-blue-500 px-8 py-3 text-lg font-medium transition-colors"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card
              variant="bordered"
              shadow="none"
              radius="lg"
              className="border-2 border-gray-200"
            >
              <CardBody className="p-8">
                <div className="inline-flex rounded-lg bg-blue-50 p-3 mb-6 w-fit">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Automated Video Creation
                </h3>
                <p className="text-gray-600">
                  Convert your articles into engaging videos with just a few clicks using our advanced AI technology.
                </p>
              </CardBody>
            </Card>

            <Card
              variant="bordered"
              shadow="none"
              radius="lg"
              className="border-2 border-gray-200"
            >
              <CardBody className="p-8">
                <div className="inline-flex rounded-lg bg-blue-50 p-3 mb-6 w-fit">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  RSS Integration
                </h3>
                <p className="text-gray-600">
                  Seamlessly connect your RSS feeds to automatically generate videos from your latest content.
                </p>
              </CardBody>
            </Card>

            <Card
              variant="bordered"
              shadow="none"
              radius="lg"
              className="border-2 border-gray-200"
            >
              <CardBody className="p-8">
                <div className="inline-flex rounded-lg bg-blue-50 p-3 mb-6 w-fit">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Customizable Styles
                </h3>
                <p className="text-gray-600">
                  Choose from a variety of professional video styles and customize them to match your brand.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
