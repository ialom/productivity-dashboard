import { useState } from 'react'
import { useTasks } from '../hooks/useTasks'
import { Link } from 'react-router-dom'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const PRIORITY_RANK = { high: 0, medium: 1, low: 2 }

const P = {
  high: {
    bar:   'bg-red-500',
    badge: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/60',
    block: 'border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-900/20',
    dot:   'bg-red-500',
  },
  medium: {
    bar:   'bg-amber-400',
    badge: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/60',
    block: 'border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-900/20',
    dot:   'bg-amber-400',
  },
  low: {
    bar:   'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/60',
    block: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800/50 dark:bg-emerald-900/20',
    dot:   'bg-emerald-500',
  },
}
const PF = {
  bar:   'bg-gray-300 dark:bg-gray-600',
  badge: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
  block: 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/60',
  dot:   'bg-gray-400',
}

const BREAK_MINUTES   = 10
const FOCUS_THRESHOLD = 90

// ---------------------------------------------------------------------------
// Scheduler helpers
// ---------------------------------------------------------------------------
function smartSort(tasks) {
  return [...tasks].sort((a, b) => {
    const pa = PRIORITY_RANK[a.priority] ?? 99
    const pb = PRIORITY_RANK[b.priority] ?? 99
    if (pa !== pb) return pa - pb
    const ha = Boolean(a.dueTime), hb = Boolean(b.dueTime)
    if (ha !== hb) return ha ? -1 : 1
    if (ha && hb && a.dueTime !== b.dueTime) return a.dueTime.localeCompare(b.dueTime)
    return (a.duration ?? Infinity) - (b.duration ?? Infinity)
  })
}

function timeToMins(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function minsToLabel(total) {
  const h24  = Math.floor(total / 60) % 24
  const m    = total % 60
  const ampm = h24 >= 12 ? 'PM' : 'AM'
  const h12  = h24 % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

function generatePlan(tasks, startTime) {
  const pending = smartSort(tasks.filter(t => !t.completed))
  let cursor     = timeToMins(startTime)
  let focusSoFar = 0
  const entries  = []

  for (const task of pending) {
    const duration = task.duration ?? 30

    if (focusSoFar > 0 && focusSoFar + duration > FOCUS_THRESHOLD) {
      entries.push({
        type: 'break',
        start: cursor, end: cursor + BREAK_MINUTES,
        startLabel: minsToLabel(cursor), endLabel: minsToLabel(cursor + BREAK_MINUTES),
      })
      cursor     += BREAK_MINUTES
      focusSoFar  = 0
    }

    entries.push({
      type: 'task', task,
      start: cursor, end: cursor + duration,
      startLabel: minsToLabel(cursor), endLabel: minsToLabel(cursor + duration),
    })
    cursor     += duration
    focusSoFar += duration
  }

  return entries
}

// ---------------------------------------------------------------------------
// Export helper — builds a standalone printable HTML page
// ---------------------------------------------------------------------------
function exportPlan(plan) {
  const date      = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const totalTasks = plan.filter(e => e.type === 'task').length
  const endTime    = plan.at(-1)?.endLabel ?? ''

  const COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' }

  const rows = plan.map(entry => {
    if (entry.type === 'break') {
      return `<tr class="break-row">
        <td class="time">${entry.startLabel} – ${entry.endLabel}</td>
        <td></td>
        <td class="task-name">☕ Break</td>
        <td class="dur">${BREAK_MINUTES} min</td>
      </tr>`
    }
    const { task } = entry
    const c = COLORS[task.priority] ?? '#6b7280'
    return `<tr>
      <td class="time">${entry.startLabel} – ${entry.endLabel}</td>
      <td><span class="badge" style="background:${c}18;color:${c};border:1px solid ${c}40">${task.priority ?? ''}</span></td>
      <td class="task-name${task.completed ? ' done' : ''}">${task.title}</td>
      <td class="dur">${task.duration ? task.duration + ' min' : '—'}</td>
    </tr>`
  }).join('\n')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Daily Plan — ${date}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 14px; color: #111827; background: #fff;
      padding: 48px 56px; max-width: 820px; margin: 0 auto; line-height: 1.55;
    }
    header { padding-bottom: 20px; margin-bottom: 32px; border-bottom: 2px solid #e5e7eb; }
    header h1 { font-size: 24px; font-weight: 700; letter-spacing: -0.4px; }
    header p  { margin-top: 4px; color: #6b7280; font-size: 13px; }
    .meta { display: flex; gap: 20px; margin-top: 10px; }
    .meta span { font-size: 12px; color: #9ca3af; }
    .meta strong { color: #374151; }
    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left; padding: 8px 12px;
      font-size: 11px; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.06em; color: #9ca3af; border-bottom: 1px solid #e5e7eb;
    }
    td { padding: 11px 12px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    .time { color: #6b7280; font-size: 13px; white-space: nowrap; width: 160px; }
    .task-name { font-weight: 500; }
    .task-name.done { text-decoration: line-through; color: #9ca3af; font-weight: 400; }
    .dur { color: #9ca3af; font-size: 13px; text-align: right; white-space: nowrap; }
    .badge {
      display: inline-block; padding: 2px 9px; border-radius: 9999px;
      font-size: 11px; font-weight: 600; text-transform: capitalize; white-space: nowrap;
    }
    .break-row td { background: #f9fafb; }
    .break-row .task-name { color: #9ca3af; font-style: italic; font-weight: 400; }
    footer { margin-top: 40px; padding-top: 14px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; }
    footer p { font-size: 11px; color: #d1d5db; }
    @media print { body { padding: 24px 32px; } @page { margin: 1cm; } }
  </style>
</head>
<body>
  <header>
    <h1>Daily Plan</h1>
    <p>${date}</p>
    <div class="meta">
      <span><strong>${totalTasks}</strong> tasks scheduled</span>
      ${endTime ? `<span>Wraps up at <strong>${endTime}</strong></span>` : ''}
    </div>
  </header>
  <table>
    <thead>
      <tr>
        <th>Time</th><th>Priority</th><th>Task</th><th style="text-align:right">Duration</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
  <footer>
    <p>Productivity Dashboard</p>
    <p>Printed ${new Date().toLocaleString()}</p>
  </footer>
  <script>setTimeout(() => window.print(), 250)</script>
</body>
</html>`

  const win = window.open('', '_blank')
  if (!win) { alert('Pop-up blocked — please allow pop-ups to export.'); return }
  win.document.write(html)
  win.document.close()
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Dashboard() {
  const { tasks, toggleTask, deleteTask } = useTasks()

  const total     = tasks.length
  const completed = tasks.filter(t => t.completed).length
  const pending   = total - completed
  const progress  = total ? Math.round((completed / total) * 100) : 0

  const [startTime, setStartTime] = useState('09:00')
  const [plan, setPlan]           = useState(null)

  function handleGenerate() { setPlan(generatePlan(tasks, startTime)) }
  function handleClear()    { setPlan(null) }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total"     value={total}     accent="indigo" />
        <StatCard label="Completed" value={completed} accent="emerald" />
        <StatCard label="Pending"   value={pending}   accent="amber" />
      </div>

      {/* Progress */}
      {total > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Progress</span>
            <span className="text-gray-700 dark:text-gray-300 font-semibold">{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
            <div
              className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">
            {completed} of {total} tasks complete
          </p>
        </div>
      )}

      {/* Generate Daily Plan */}
      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Generate Daily Plan</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Auto-schedules pending tasks · {BREAK_MINUTES}-min break every {FOCUS_THRESHOLD} min focus · tasks without duration default to 30 min
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Start</label>
            <input
              type="time"
              value={startTime}
              onChange={e => { setStartTime(e.target.value); setPlan(null) }}
              className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleGenerate}
              disabled={pending === 0}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg text-sm font-medium active:scale-95 transition-all whitespace-nowrap"
            >
              Generate
            </button>
          </div>
        </div>

        {pending === 0 && total > 0 && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
            All tasks complete — nothing to schedule!
          </p>
        )}

        {plan && plan.length > 0 && (
          <div className="pt-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Your Schedule
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
                  {plan.filter(e => e.type === 'task').length} tasks · ends {plan.at(-1)?.endLabel}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportPlan(plan)}
                  className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <PrintIcon />
                  Export Plan
                </button>
                <button
                  onClick={handleClear}
                  className="text-xs text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors px-2 py-1.5"
                >
                  Clear
                </button>
              </div>
            </div>
            <Timeline entries={plan} onToggle={toggleTask} />
          </div>
        )}
      </section>

      {/* All tasks */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">All Tasks</h2>
            {total > 0 && (
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
                Priority · due time · shortest duration
              </p>
            )}
          </div>
          <Link
            to="/add-task"
            className="text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg transition-colors"
          >
            + Add Task
          </Link>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-14 text-gray-400 dark:text-gray-600">
            <p className="text-base font-medium">No tasks yet</p>
            <Link to="/add-task" className="text-indigo-500 hover:text-indigo-400 text-sm mt-1 inline-block">
              Create your first task →
            </Link>
          </div>
        ) : (
          <TaskList tasks={smartSort(tasks)} onToggle={toggleTask} onDelete={deleteTask} />
        )}
      </section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------
function Timeline({ entries, onToggle }) {
  return (
    <ol className="relative border-l-2 border-indigo-100 dark:border-indigo-900 ml-3 space-y-1.5">
      {entries.map((entry, i) =>
        entry.type === 'break'
          ? <BreakBlock  key={i} entry={entry} />
          : <TaskBlock   key={i} entry={entry} onToggle={onToggle} />
      )}
      <li className="ml-6 pt-0.5">
        <span className="text-xs text-gray-400 dark:text-gray-600 font-medium">
          {entries.at(-1)?.endLabel} — Done
        </span>
      </li>
    </ol>
  )
}

function TaskBlock({ entry, onToggle }) {
  const { task, startLabel, endLabel } = entry
  const s = P[task.priority] ?? PF
  return (
    <li className="ml-6 relative">
      <span className={`absolute -left-[1.875rem] top-4 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-gray-900 ${s.dot}`} />
      <div className={`border rounded-xl px-4 py-3 ${s.block}`}>
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggle(task.id)}
            className="mt-0.5 w-4 h-4 accent-indigo-600 cursor-pointer flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold leading-snug ${task.completed ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-800 dark:text-gray-100'}`}>
              {task.title}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
              {startLabel} – {endLabel}
              {task.duration && <span className="ml-2 text-gray-400 dark:text-gray-600">({task.duration} min)</span>}
            </p>
          </div>
          <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${s.badge}`}>
            {task.priority}
          </span>
        </div>
      </div>
    </li>
  )
}

function BreakBlock({ entry }) {
  return (
    <li className="ml-6 relative">
      <span className="absolute -left-[1.875rem] top-3.5 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-gray-900 bg-gray-300 dark:bg-gray-700" />
      <div className="border border-dashed border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 flex items-center gap-2.5 bg-gray-50 dark:bg-gray-800/50">
        <span className="text-sm">☕</span>
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-500">Break · {BREAK_MINUTES} min</p>
          <p className="text-xs text-gray-400 dark:text-gray-600">{entry.startLabel} – {entry.endLabel}</p>
        </div>
      </div>
    </li>
  )
}

// ---------------------------------------------------------------------------
// Task list
// ---------------------------------------------------------------------------
function TaskList({ tasks, onToggle, onDelete }) {
  return (
    <ul className="space-y-2">
      {tasks.map(task => {
        const s = P[task.priority] ?? PF
        return (
          <li
            key={task.id}
            className={`flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm ${task.completed ? 'opacity-50' : ''}`}
          >
            <div className={`w-1 self-stretch flex-shrink-0 ${s.bar}`} />
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggle(task.id)}
              className="w-4 h-4 accent-indigo-600 cursor-pointer flex-shrink-0"
            />
            <div className="flex-1 min-w-0 py-3">
              <p className={`text-sm font-medium truncate ${task.completed ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-800 dark:text-gray-100'}`}>
                {task.title}
              </p>
              <div className="flex items-center gap-3 mt-0.5">
                {task.dueTime  && <span className="text-xs text-gray-400 dark:text-gray-600">⏰ {task.dueTime}</span>}
                {task.duration && <span className="text-xs text-gray-400 dark:text-gray-600">⏱ {task.duration} min</span>}
              </div>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize flex-shrink-0 ${s.badge}`}>
              {task.priority ?? '—'}
            </span>
            <button
              onClick={() => onDelete(task.id)}
              className="mr-3 flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-gray-300 dark:text-gray-700 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-xl leading-none"
              aria-label="Delete task"
            >
              ×
            </button>
          </li>
        )
      })}
    </ul>
  )
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------
const ACCENT = {
  indigo:  { bg: 'bg-indigo-50 dark:bg-indigo-900/20',  border: 'border-indigo-200 dark:border-indigo-800/50',  text: 'text-indigo-700 dark:text-indigo-400'  },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800/50', text: 'text-emerald-700 dark:text-emerald-400' },
  amber:   { bg: 'bg-amber-50 dark:bg-amber-900/20',    border: 'border-amber-200 dark:border-amber-800/50',    text: 'text-amber-700 dark:text-amber-400'    },
}

function StatCard({ label, value, accent }) {
  const a = ACCENT[accent]
  return (
    <div className={`border rounded-2xl p-5 ${a.bg} ${a.border}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-600 mb-2">{label}</p>
      <p className={`text-3xl font-bold ${a.text}`}>{value}</p>
    </div>
  )
}

function PrintIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
      <rect x="6" y="14" width="12" height="8"/>
    </svg>
  )
}
