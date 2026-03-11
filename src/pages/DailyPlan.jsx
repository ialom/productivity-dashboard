import { useTasks } from '../hooks/useTasks'
import { Link } from 'react-router-dom'

const PRIORITY_BADGE = {
  high:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  low:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6) // 06:00 – 21:00
const pad   = n => String(n).padStart(2, '0')

export default function DailyPlan() {
  const { tasks, toggleTask, deleteTask } = useTasks()

  const today      = new Date().toISOString().split('T')[0]
  const todayTasks = tasks.filter(t => t.dueDate === today)
  const unscheduled = todayTasks.filter(t => !t.timeBlock)

  function taskForHour(hour) {
    return todayTasks.filter(t => t.timeBlock?.startsWith(`${pad(hour)}:`))
  }

  const completed = todayTasks.filter(t => t.completed).length
  const progress  = todayTasks.length ? Math.round((completed / todayTasks.length) * 100) : 0

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Daily Plan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link
          to="/add-task"
          className="text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg transition-colors"
        >
          + Add Task
        </Link>
      </div>

      {/* Progress */}
      {todayTasks.length > 0 && (
        <div className="mb-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500 dark:text-gray-400">{completed} of {todayTasks.length} tasks done</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
            <div
              className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {todayTasks.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-600">
          <p className="text-base font-medium">No tasks scheduled for today</p>
          <Link to="/add-task" className="text-indigo-500 hover:text-indigo-400 text-sm mt-2 inline-block">
            Schedule a task →
          </Link>
        </div>
      ) : (
        <>
          {/* Hourly timeline */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-3">Timeline</h2>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-100 dark:divide-gray-800">
              {HOURS.map(hour => {
                const hourTasks = taskForHour(hour)
                const active    = hourTasks.length > 0
                return (
                  <div
                    key={hour}
                    className={`flex gap-4 px-4 py-2.5 ${active ? 'bg-indigo-50 dark:bg-indigo-900/10' : ''}`}
                  >
                    <span className="text-xs text-gray-400 dark:text-gray-600 w-12 pt-0.5 flex-shrink-0 font-mono">
                      {pad(hour)}:00
                    </span>
                    <div className="flex-1 space-y-1.5">
                      {active ? (
                        hourTasks.map(task => (
                          <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                        ))
                      ) : (
                        <span className="text-xs text-gray-200 dark:text-gray-800">—</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Unscheduled */}
          {unscheduled.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-3">Unscheduled</h2>
              <div className="space-y-2">
                {unscheduled.map(task => (
                  <div key={task.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 shadow-sm">
                    <TaskRow task={task} onToggle={toggleTask} onDelete={deleteTask} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function TaskRow({ task, onToggle, onDelete }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        className="w-4 h-4 accent-indigo-600 cursor-pointer flex-shrink-0"
      />
      <span className={`flex-1 text-sm ${task.completed ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-800 dark:text-gray-100'}`}>
        {task.title}
      </span>
      {task.timeBlock && (
        <span className="text-xs text-gray-400 dark:text-gray-600 flex-shrink-0 font-mono">{task.timeBlock}</span>
      )}
      {task.priority && (
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize flex-shrink-0 ${PRIORITY_BADGE[task.priority] ?? ''}`}>
          {task.priority}
        </span>
      )}
      <button
        onClick={() => onDelete(task.id)}
        className="text-gray-300 dark:text-gray-700 hover:text-red-500 transition-colors text-xl leading-none flex-shrink-0"
        aria-label="Delete"
      >
        ×
      </button>
    </div>
  )
}
