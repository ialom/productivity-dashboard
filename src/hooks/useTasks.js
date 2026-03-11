import { useState, useEffect } from 'react'

const STORAGE_KEY = 'productivity_tasks'

export function useTasks() {
  const [tasks, setTasks] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  function addTask(task) {
    setTasks(prev => [
      ...prev,
      { ...task, id: crypto.randomUUID(), createdAt: new Date().toISOString(), completed: false },
    ])
  }

  function toggleTask(id) {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  function deleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  function updateTask(id, updates) {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)))
  }

  return { tasks, addTask, toggleTask, deleteTask, updateTask }
}
