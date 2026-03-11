import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import AddTask from './pages/AddTask'
import DailyPlan from './pages/DailyPlan'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
          <Navbar />
          <main>
            <Routes>
              <Route path="/"          element={<Dashboard />} />
              <Route path="/add-task"  element={<AddTask />} />
              <Route path="/daily-plan" element={<DailyPlan />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}
