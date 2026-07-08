import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { WebsiteProvider } from './context/WebsiteContext'
import { HomePage } from './pages/HomePage'
import { EditorPage } from './pages/EditorPage'
import { PreviewPage } from './pages/PreviewPage'
import { TemplateDemoPage } from './pages/TemplateDemoPage'
import { SiteViewPage } from './pages/SiteViewPage'

export default function App() {
  return (
    <WebsiteProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/demo/:templateId/*" element={<TemplateDemoPage />} />
          <Route path="/editor/:templateId" element={<EditorPage />} />
          <Route path="/preview/:templateId/*" element={<PreviewPage />} />
          <Route path="/site/:templateId/*" element={<SiteViewPage />} />
        </Routes>
      </BrowserRouter>
    </WebsiteProvider>
  )
}