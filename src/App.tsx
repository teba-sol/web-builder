import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { RequireAuth } from './auth/RequireAuth'
import { WebsiteProvider } from './context/WebsiteContext'
import { HomePage } from './pages/HomePage'
import { EditorPage } from './pages/EditorPage'
import { PickTemplatePage } from './pages/PickTemplatePage'
import { PreviewPage } from './pages/PreviewPage'
import { TemplateDemoPage } from './pages/TemplateDemoPage'
import { SiteViewPage } from './pages/SiteViewPage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { AccountPage } from './pages/AccountPage'
import { SandboxBillingPage } from './pages/SandboxBillingPage'

export default function App() {
  return (
    <AuthProvider>
      <WebsiteProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/billing/sandbox" element={<SandboxBillingPage />} />
            <Route path="/pick-template" element={<PickTemplatePage />} />
            <Route path="/demo/:templateId/*" element={<TemplateDemoPage />} />
            <Route
              path="/editor/:templateId/*"
              element={
                <RequireAuth>
                  <EditorPage />
                </RequireAuth>
              }
            />
            <Route
              path="/preview/:templateId/*"
              element={
                <RequireAuth>
                  <PreviewPage />
                </RequireAuth>
              }
            />
            <Route path="/site/:templateId/*" element={<SiteViewPage />} />
          </Routes>
        </BrowserRouter>
      </WebsiteProvider>
    </AuthProvider>
  )
}
