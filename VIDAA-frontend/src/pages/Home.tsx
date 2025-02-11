import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">VIDAA Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/articles"
          className="group block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
        >
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded mr-3 group-hover:scale-110 transition-transform"></div>
            <h2 className="text-2xl font-semibold text-gray-800">Articles</h2>
          </div>
          <p className="text-gray-600">View and manage article listings</p>
        </Link>

        <Link
          to="/features"
          className="group block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
        >
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full mr-3 group-hover:scale-110 transition-transform"></div>
            <h2 className="text-2xl font-semibold text-gray-800">New Features</h2>
          </div>
          <p className="text-gray-600">Exciting new features coming soon!</p>
        </Link>
      </div>
    </div>
  )
}
