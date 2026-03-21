import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar'
import { ChatArea } from '@/widgets/chat-area/ui/ChatArea'
import { SettingsPage } from '@/pages/settings/ui/SettingsPage'
import { ProfileSettings } from '@/pages/settings/ui/ProfileSettings'
import { NotificationsSettings } from '@/pages/settings/ui/NotificationsSettings'
import { AppearanceSettings } from '@/pages/settings/ui/AppearanceSettings'
import { PrivacySettings } from '@/pages/settings/ui/PrivacySettings'
import { DataStorageSettings } from '@/pages/settings/ui/DataStorageSettings'
import { AuthPage } from '@/pages/auth/ui/AuthPage'
import { useAuthStore } from '@/entities/user/model/authStore'
import { useUser } from '@/entities/user/model/useUser'
import { useEffect } from 'react'

function App() {
  const location = useLocation()
  console.log('Current location:', location.pathname);
  
  const isAuthPage = location.pathname === '/login'
  const { isAuthenticated, token, fetchChats } = useAuthStore()
  const { fetchCurrentUser } = useUser()

  console.log('Auth status:', { isAuthenticated, hasToken: !!token });

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchCurrentUser()
      fetchChats()
    }
  }, [isAuthenticated, token])

  if (isAuthPage) {
    console.log('Rendering AuthPage');
    return <AuthPage />
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to /login');
    return <Navigate to="/login" replace />
  }

  console.log('Rendering Main App');
  return (
    <div className="h-screen w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex overflow-hidden transition-colors">
      <Sidebar />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <Routes>
          <Route path="/chat/:chatId" element={<ChatArea />} />
          <Route path="/chat" element={<ChatArea />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/profile" element={<ProfileSettings />} />
          <Route path="/settings/notifications" element={<NotificationsSettings />} />
          <Route path="/settings/appearance" element={<AppearanceSettings />} />
          <Route path="/settings/privacy" element={<PrivacySettings />} />
          <Route path="/settings/data" element={<DataStorageSettings />} />
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App
