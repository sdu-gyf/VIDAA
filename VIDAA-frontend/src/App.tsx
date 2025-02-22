import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HeroUIProvider } from '@heroui/react'
import { MainLayout } from './components/layout/MainLayout'
import { GenVideoLayout } from './components/layout/GenVideoLayout'
import { HomePage } from './pages/Home'
import { GenVideoPage } from './pages/GenVideo'
import { ComingSoonPage } from './pages/ComingSoon'
import { NotFoundPage } from './pages/NotFound'
import "./styles/animations.css"
import { VideoConfigProvider } from './contexts/VideoConfigContext'

function App() {
  return (
    <VideoConfigProvider>
      <HeroUIProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="gen-video" element={<GenVideoLayout />}>
                <Route index element={<GenVideoPage />} />
              </Route>
              <Route path="features" element={
                <ComingSoonPage
                  title="New Features Coming Soon"
                  description="We're working on exciting new features to enhance your experience. Check back soon!"
                />
              } />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </HeroUIProvider>
    </VideoConfigProvider>
  )
}

export default App
