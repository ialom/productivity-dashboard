import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import AddTask from './pages/AddTask'
import DailyPlan from './pages/DailyPlan'

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-dvh bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100">
          <Navbar />
          {/* pb accounts for Android gesture-navigation bar */}
          <main className="pb-[env(safe-area-inset-bottom)]">
            <Routes>
              <Route path="/"           element={<Dashboard />} />
              <Route path="/add-task"   element={<AddTask />} />
              <Route path="/daily-plan" element={<DailyPlan />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  )
}
