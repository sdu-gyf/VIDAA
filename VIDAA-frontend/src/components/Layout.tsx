import { Link, Outlet } from 'react-router-dom'

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Header */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-gray-800">VIDAA</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md"
              >
                Home
              </Link>
              <Link
                to="/articles"
                className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md"
              >
                Articles
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-8">
        <Outlet />
      </main>
    </div>
  )
}
