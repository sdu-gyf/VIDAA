import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HeroUIProvider } from '@heroui/react'
import { Layout } from './components/Layout'
import { HomePage } from './pages/Home'
import { ArticleListPage } from './pages/ArticleList'
import { ComingSoonPage } from './pages/ComingSoon'
import "./App.css"

function App() {
  return (
    <HeroUIProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="articles" element={<ArticleListPage />} />
            <Route path="features" element={
              <ComingSoonPage
                title="New Features Coming Soon"
                description="We're working on exciting new features to enhance your experience. Check back soon!"
              />
            } />
            <Route path="*" element={
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-800">404 - Page Not Found</h2>
              </div>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </HeroUIProvider>
  )
}

export default App
