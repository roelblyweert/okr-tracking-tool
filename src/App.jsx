import { useTheme } from './hooks/useTheme'
import { Header } from './components/Header'
import { MainContent } from './components/MainContent'

export default function App() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <Header theme={theme} onToggle={toggleTheme} />
      <MainContent />
    </div>
  )
}
