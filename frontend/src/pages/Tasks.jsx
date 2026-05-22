import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getTasks, updateTask, deleteTask } from '../api/tasks'
import { getProjects } from '../api/projects'
import useTitle from '../hooks/useTitle'
import { CheckSquare, Trash2, Loader, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

const statusStyle = {
  TODO: { background: 'var(--app-hover)', color: 'var(--app-muted)' },
  IN_PROGRESS: { background: 'rgba(35,131,226,0.1)', color: '#2383e2' },
  DONE: { background: 'rgba(34,197,94,0.1)', color: '#22c55e' },
}

const priorityColor = {
  LOW: 'var(--app-muted)',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444',
}

const Tasks = () => {
  useTitle('Tasks')
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 })
  const [filters, setFilters] = useState({ status: '', priority: '', projectId: '', page: 1, limit: 10 })

  useEffect(() => {
    getProjects().then((res) => setProjects(res.data.data)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
    getTasks(params)
      .then((res) => {
        setTasks(res.data.data.tasks)
        setPagination(res.data.data.pagination)
      })
      .catch(() => toast.error('Failed to load tasks'))
      .finally(() => setLoading(false))
  }, [filters])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  const handleStatusChange = async (taskId, status) => {
    try {
      await updateTask(taskId, { status })
      setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status } : t))
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return
    setDeletingId(taskId)
    try {
      await deleteTask(taskId)
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
      toast.success('Task deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  const isOverdue = (task) =>
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-black" style={{ color: 'var(--app-text)' }}>Tasks</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--app-muted)' }}>
          {pagination.total} task{pagination.total !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-xl p-4" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-3.5 h-3.5" style={{ color: 'var(--app-muted)' }} />
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--app-muted)' }}>Filters</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 rounded-lg text-xs outline-none"
            style={{ background: 'var(--app-bg)', border: '1px solid var(--app-border)', color: 'var(--app-text)' }}>
            <option value="">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
          <select value={filters.priority} onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="px-3 py-2 rounded-lg text-xs outline-none"
            style={{ background: 'var(--app-bg)', border: '1px solid var(--app-border)', color: 'var(--app-text)' }}>
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <select value={filters.projectId} onChange={(e) => handleFilterChange('projectId', e.target.value)}
            className="px-3 py-2 rounded-lg text-xs outline-none"
            style={{ background: 'var(--app-bg)', border: '1px solid var(--app-border)', color: 'var(--app-text)' }}>
            <option value="">All Projects</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        {(filters.status || filters.priority || filters.projectId) && (
          <button onClick={() => setFilters({ status: '', priority: '', projectId: '', page: 1, limit: 10 })}
            className="mt-3 text-xs font-semibold hover:underline" style={{ color: 'var(--app-accent)' }}>
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-5 h-5 animate-spin" style={{ color: 'var(--app-accent)' }} />
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20" style={{ color: 'var(--app-muted)' }}>
            <CheckSquare className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm font-semibold" style={{ color: 'var(--app-text)' }}>No tasks found</p>
            <p className="text-xs mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--app-border)', background: 'var(--app-hover)' }}>
                    {['Task', 'Project', 'Priority', 'Status', 'Due Date', 'Assigned',
                      ...(user?.role === 'ADMIN' ? ['Actions'] : [])
                    ].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest"
                        style={{ color: 'var(--app-muted)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, i) => (
                    <tr key={task.id}
                      className="transition-colors"
                      style={{ borderBottom: i < tasks.length - 1 ? '1px solid var(--app-border)' : 'none' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--app-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td className="px-5 py-3">
                        <p className="text-sm font-semibold" style={{ color: 'var(--app-text)' }}>{task.title}</p>
                        {task.description && (
                          <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--app-muted)' }}>{task.description}</p>
                        )}
                        {isOverdue(task) && <span className="text-xs text-red-400 font-bold">Overdue</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs" style={{ color: 'var(--app-muted)' }}>{task.project?.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold" style={{ color: priorityColor[task.priority] }}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className="text-xs px-2 py-1 rounded font-bold outline-none cursor-pointer border-0"
                          style={statusStyle[task.status]}>
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="DONE">Done</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs" style={{ color: isOverdue(task) ? '#ef4444' : 'var(--app-muted)' }}>
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {task.assignedTo ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                              style={{ background: 'var(--app-accent)' }}>
                              {task.assignedTo.name.charAt(0)}
                            </div>
                            <span className="text-xs" style={{ color: 'var(--app-muted)' }}>{task.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--app-muted)' }}>Unassigned</span>
                        )}
                      </td>
                      {user?.role === 'ADMIN' && (
                        <td className="px-4 py-3">
                          <button onClick={() => handleDelete(task.id)} disabled={deletingId === task.id}
                            className="hover:text-red-400 transition-colors disabled:opacity-50"
                            style={{ color: 'var(--app-muted)' }}>
                            {deletingId === task.id
                              ? <Loader className="w-4 h-4 animate-spin" />
                              : <Trash2 className="w-4 h-4" />}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3"
                style={{ borderTop: '1px solid var(--app-border)' }}>
                <p className="text-xs" style={{ color: 'var(--app-muted)' }}>
                  {((pagination.page - 1) * filters.limit) + 1}–
                  {Math.min(pagination.page * filters.limit, pagination.total)} of {pagination.total}
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="p-1.5 rounded-lg disabled:opacity-30 hover:opacity-70"
                    style={{ border: '1px solid var(--app-border)', color: 'var(--app-text)' }}>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-semibold" style={{ color: 'var(--app-text)' }}>
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <button onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="p-1.5 rounded-lg disabled:opacity-30 hover:opacity-70"
                    style={{ border: '1px solid var(--app-border)', color: 'var(--app-text)' }}>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Tasks