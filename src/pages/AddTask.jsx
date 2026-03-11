import { useState } from 'react'
import { useTasks } from '../hooks/useTasks'

const PRIORITIES = ['low', 'medium', 'high']

const PRIORITY_TOGGLE = {
  high:   { active: 'bg-red-500 text-white border-red-500',     idle: 'border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'     },
  medium: { active: 'bg-amber-400 text-white border-amber-400', idle: 'border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20' },
  low:    { active: 'bg-emerald-500 text-white border-emerald-500', idle: 'border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' },
}

const PRIORITY_BADGE = {
  high:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  low:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}

const empty = { name: '', priority: 'medium', duration: '', dueTime: '' }

const inputCls = (error) =>
  `w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
    error
      ? 'border-red-400 dark:border-red-700'
      : 'border-gray-300 dark:border-gray-700'
  }`

export default function AddTask() {
  const { tasks, addTask, deleteTask, toggleTask } = useTasks()
  const [form, setForm]     = useState(empty)
  const [errors, setErrors] = useState({})
  const [flash, setFlash]   = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: undefined }))
  }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Task name is required.'
    if (form.duration && (isNaN(form.duration) || Number(form.duration) <= 0))
      errs.duration = 'Enter a positive number of minutes.'
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    addTask({
      title:    form.name.trim(),
      priority: form.priority,
      duration: form.duration ? Number(form.duration) : null,
      dueTime:  form.dueTime || null,
    })
    setForm(empty)
    setFlash(true)
    setTimeout(() => setFlash(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Add Task</h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-5"
      >
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Task Name <span className="text-red-400">*</span>
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Review pull requests"
            className={inputCls(errors.name)}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
          <div className="flex gap-2">
            {PRIORITIES.map(p => {
              const s       = PRIORITY_TOGGLE[p]
              const isActive = form.priority === p
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, priority: p }))}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${isActive ? s.active : s.idle}`}
                >
                  {p}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Duration <span className="text-xs font-normal text-gray-400 dark:text-gray-600">(minutes)</span>
            </label>
            <input
              name="duration"
              type="number"
              min="1"
              value={form.duration}
              onChange={handleChange}
              placeholder="e.g. 30"
              className={inputCls(errors.duration)}
            />
            {errors.duration && <p className="text-xs text-red-500 mt-1">{errors.duration}</p>}
          </div>

          {/* Due time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Due Time <span className="text-xs font-normal text-gray-400 dark:text-gray-600">(optional)</span>
            </label>
            <input
              name="dueTime"
              type="time"
              value={form.dueTime}
              onChange={handleChange}
              className={inputCls()}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white py-2.5 rounded-lg text-sm font-semibold transition-all"
          >
            Save Task
          </button>
          {flash && (
            <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              Saved!
            </span>
          )}
        </div>
      </form>

      {/* Task list */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Saved Tasks
          <span className="ml-2 text-sm font-normal text-gray-400 dark:text-gray-600">({tasks.length})</span>
        </h2>

        {tasks.length === 0 ? (
          <p className="text-sm text-center text-gray-400 dark:text-gray-600 py-10">
            No tasks yet. Add one above.
          </p>
        ) : (
          <ul className="space-y-2">
            {tasks.map(task => (
              <li
                key={task.id}
                className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 shadow-sm"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="w-4 h-4 accent-indigo-600 cursor-pointer flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${task.completed ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-800 dark:text-gray-100'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {task.duration && <span className="text-xs text-gray-400 dark:text-gray-600">⏱ {task.duration} min</span>}
                    {task.dueTime  && <span className="text-xs text-gray-400 dark:text-gray-600">⏰ {task.dueTime}</span>}
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize flex-shrink-0 ${PRIORITY_BADGE[task.priority] ?? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                  {task.priority}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-gray-300 dark:text-gray-700 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-xl leading-none"
                  aria-label="Delete task"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
