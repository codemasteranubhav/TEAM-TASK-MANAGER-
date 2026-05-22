import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProjectById, addMember, removeMember } from '../api/projects'
import { createTask, updateTask, deleteTask } from '../api/tasks'
import useTitle from '../hooks/useTitle'
import { ArrowLeft, Plus, Trash2, Loader, X, Users, UserPlus, CheckSquare } from 'lucide-react'
import toast from 'react-hot-toast'

const statusColumns = ['TODO', 'IN_PROGRESS', 'DONE']
const statusLabels = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' }

const statusStyle = {
  TODO: { background: 'rgba(155,155,155,0.15)', color: '#9b9b9b' },
  IN_PROGRESS: { background: 'rgba(35,131,226,0.15)', color: '#2383e2' },
  DONE: { background: 'rgba(34,197,94,0.15)', color: '#22c55e' },
}

const priorityDot = { LOW: '#9b9b9b', MEDIUM: '#f59e0b', HIGH: '#ef4444' }
const priorityStyle = { LOW: { color: '#9b9b9b' }, MEDIUM: { color: '#f59e0b' }, HIGH: { color: '#ef4444' } }

const CreateTaskModal = ({ projectId, members, onClose, onCreated }) => {
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assignedToId: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return setError('Task title is required')
    setLoading(true)
    try {
      const payload = { ...formData, projectId, assignedToId: formData.assignedToId || undefined, dueDate: formData.dueDate || undefined }
      const res = await createTask(payload)
      onCreated(res.data.data)
      toast.success('Task created!')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="w-full max-w-md rounded-2xl shadow-2xl" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--app-border)' }}>
          <p className="text-sm font-bold" style={{ color: 'var(--app-text)' }}>Create Task</p>
          <button onClick={onClose} className="hover:opacity-70" style={{ color: 'var(--app-muted)' }}><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: 'var(--app-muted)' }}>Title</label>
            <input type="text" value={formData.title} onChange={(e) => { setFormData({ ...formData, title: e.target.value }); setError('') }}
              placeholder="e.g. Design landing page" className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--app-bg)', border: `1.5px solid ${error ? '#ef4444' : 'var(--app-border)'}`, color: 'var(--app-text)' }} />
            {error && <p className="text-red-400 text-xs mt-1 font-medium">{error}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: 'var(--app-muted)' }}>Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Task details..." rows={2} className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{ background: 'var(--app-bg)', border: '1.5px solid var(--app-border)', color: 'var(--app-text)' }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: 'var(--app-muted)' }}>Priority</label>
              <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'var(--app-bg)', border: '1.5px solid var(--app-border)', color: 'var(--app-text)' }}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: 'var(--app-muted)' }}>Due Date</label>
              <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'var(--app-bg)', border: '1.5px solid var(--app-border)', color: 'var(--app-text)' }} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: 'var(--app-muted)' }}>Assign To</label>
            <select value={formData.assignedToId} onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--app-bg)', border: '1.5px solid var(--app-border)', color: 'var(--app-text)' }}>
              <option value="">Unassigned</option>
              {members.map((m) => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-xs font-bold"
              style={{ background: 'var(--app-hover)', color: 'var(--app-muted)', border: '1px solid var(--app-border)' }}>Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5"
              style={{ background: 'var(--app-accent)' }}>
              {loading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const AddMemberModal = ({ onClose, onAdded }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { id } = useParams()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try {
      const res = await addMember(id, { email, role: 'MEMBER' })
      onAdded(res.data.data)
      toast.success('Member added!')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="w-full max-w-sm rounded-2xl shadow-2xl" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--app-border)' }}>
          <p className="text-sm font-bold" style={{ color: 'var(--app-text)' }}>Add Member</p>
          <button onClick={onClose} className="hover:opacity-70" style={{ color: 'var(--app-muted)' }}><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: 'var(--app-muted)' }}>Member Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="member@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--app-bg)', border: '1.5px solid var(--app-border)', color: 'var(--app-text)' }} />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-xs font-bold"
              style={{ background: 'var(--app-hover)', color: 'var(--app-muted)', border: '1px solid var(--app-border)' }}>Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center"
              style={{ background: 'var(--app-accent)' }}>
              {loading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const TaskCard = ({ task, isAdmin, onStatusChange, onDelete, deletingId }) => {
  const [updating, setUpdating] = useState(false)
  const [hidden, setHidden] = useState(false)

  const nextStatus = { TODO: 'IN_PROGRESS', IN_PROGRESS: 'DONE', DONE: null }
  const nextLabel = { TODO: 'Start Progress', IN_PROGRESS: 'Mark Complete', DONE: null }
  const prevStatus = { TODO: null, IN_PROGRESS: 'TODO', DONE: 'IN_PROGRESS' }
  const prevLabel = { TODO: null, IN_PROGRESS: 'Move to Todo', DONE: 'Reopen' }

  const handleMove = async (newStatus) => {
    setUpdating(true)
    setHidden(true)
    await new Promise((r) => setTimeout(r, 200))
    await onStatusChange(task.id, newStatus)
    setUpdating(false)
  }

  if (hidden) return null

  return (
    <div className="rounded-xl p-4 group transition-all duration-200"
      style={{
        background: 'var(--app-bg)',
        border: '1px solid var(--app-border)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        transform: updating ? 'scale(0.95)' : 'scale(1)',
        opacity: updating ? 0 : 1,
        transition: 'transform 0.2s, opacity 0.2s',
      }}>

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-sm font-bold leading-snug" style={{ color: 'var(--app-text)' }}>{task.title}</p>
        {isAdmin && (
          <button onClick={() => onDelete(task.id)} disabled={deletingId === task.id}
            className="opacity-0 group-hover:opacity-100 transition-all shrink-0 hover:text-red-400"
            style={{ color: 'var(--app-muted)' }}>
            {deletingId === task.id ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {task.description && (
        <p className="text-xs mb-3 line-clamp-2 leading-relaxed" style={{ color: 'var(--app-muted)' }}>{task.description}</p>
      )}

      {/* Priority + Due */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: priorityDot[task.priority] }} />
          <span className="text-xs font-bold" style={priorityStyle[task.priority]}>{task.priority}</span>
        </div>
        {task.dueDate && (
          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
            style={{
              background: new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'rgba(239,68,68,0.15)' : 'var(--app-hover)',
              color: new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? '#ef4444' : 'var(--app-muted)',
            }}>
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>

      {/* Assignee */}
      {task.assignedTo && (
        <div className="flex items-center gap-2 mb-3 pb-3" style={{ borderBottom: '1px solid var(--app-border)' }}>
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-black"
            style={{ background: 'var(--app-accent)' }}>
            {task.assignedTo.name.charAt(0)}
          </div>
          <span className="text-xs" style={{ color: 'var(--app-muted)' }}>{task.assignedTo.name}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-1.5">
        {nextStatus[task.status] && (
          <button onClick={() => handleMove(nextStatus[task.status])} disabled={updating}
            className="w-full py-2 rounded-lg text-xs font-black transition-all hover:opacity-80 active:scale-[0.98]"
            style={{ background: 'var(--app-accent)', color: '#ffffff' }}>
            {updating ? <Loader className="w-3.5 h-3.5 animate-spin mx-auto" /> : `${nextLabel[task.status]} →`}
          </button>
        )}
        {prevStatus[task.status] && (
          <button onClick={() => handleMove(prevStatus[task.status])} disabled={updating}
            className="w-full py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80"
            style={{ background: 'var(--app-hover)', color: 'var(--app-muted)', border: '1px solid var(--app-border)' }}>
            ← {prevLabel[task.status]}
          </button>
        )}
        {task.status === 'DONE' && (
          <div className="w-full py-2 rounded-lg text-xs font-black flex items-center justify-center gap-1.5"
            style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
            ✓ Completed
          </div>
        )}
      </div>
    </div>
  )
}

const ProjectDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  useTitle('Project')

  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [deletingTaskId, setDeletingTaskId] = useState(null)

  const isAdmin = project?.createdById === user?.id

  useEffect(() => {
    getProjectById(id)
      .then((res) => setProject(res.data.data))
      .catch(() => { toast.error('Project not found'); navigate('/projects') })
      .finally(() => setLoading(false))
  }, [id])

  const handleStatusChange = async (taskId, status) => {
    try {
      await updateTask(taskId, { status })
      await new Promise((r) => setTimeout(r, 250))
      setProject((prev) => ({ ...prev, tasks: prev.tasks.map((t) => t.id === taskId ? { ...t, status } : t) }))
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return
    setDeletingTaskId(taskId)
    try {
      await deleteTask(taskId)
      setProject((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== taskId) }))
      toast.success('Task deleted')
    } catch { toast.error('Failed to delete') }
    finally { setDeletingTaskId(null) }
  }

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return
    try {
      await removeMember(id, userId)
      setProject((prev) => ({ ...prev, members: prev.members.filter((m) => m.userId !== userId) }))
      toast.success('Member removed')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to remove') }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl">
        <div className="h-8 w-64 rounded animate-pulse" style={{ background: 'var(--app-surface)' }} />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-64 rounded-xl animate-pulse" style={{ background: 'var(--app-surface)' }} />)}
        </div>
      </div>
    )
  }

  const tasksByStatus = statusColumns.reduce((acc, status) => {
    acc[status] = project?.tasks?.filter((t) => t.status === status) || []
    return acc
  }, {})

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/projects')} className="hover:opacity-70" style={{ color: 'var(--app-muted)' }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-black" style={{ color: 'var(--app-text)' }}>{project?.name}</h1>
          {project?.description && <p className="text-sm mt-0.5" style={{ color: 'var(--app-muted)' }}>{project.description}</p>}
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button onClick={() => setShowMemberModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all"
              style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)', color: 'var(--app-text)' }}>
              <UserPlus className="w-3.5 h-3.5" /> Add Member
            </button>
            <button onClick={() => setShowTaskModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white"
              style={{ background: 'var(--app-accent)' }}>
              <Plus className="w-3.5 h-3.5" /> Add Task
            </button>
          </div>
        )}
      </div>

      {/* Members */}
      <div className="rounded-xl p-4" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-3.5 h-3.5" style={{ color: 'var(--app-muted)' }} />
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--app-muted)' }}>
            Members ({project?.members?.length})
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {project?.members?.map((m) => (
            <div key={m.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: 'var(--app-hover)', border: '1px solid var(--app-border)' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-black"
                style={{ background: 'var(--app-accent)' }}>
                {m.user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold" style={{ color: 'var(--app-text)' }}>{m.user.name}</span>
              <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                style={m.role === 'ADMIN' ? { background: 'rgba(35,131,226,0.1)', color: '#2383e2' } : { background: 'var(--app-surface)', color: 'var(--app-muted)' }}>
                {m.role}
              </span>
              {isAdmin && m.userId !== user?.id && (
                <button onClick={() => handleRemoveMember(m.userId)} className="hover:text-red-400 ml-1" style={{ color: 'var(--app-muted)' }}>
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {statusColumns.map((status) => (
          <div key={status} className="rounded-xl p-4" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full"
                  style={{ background: status === 'TODO' ? '#9b9b9b' : status === 'IN_PROGRESS' ? '#2383e2' : '#22c55e' }} />
                <span className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--app-text)' }}>
                  {statusLabels[status]}
                </span>
              </div>
              <span className="text-xs font-black w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--app-hover)', color: 'var(--app-muted)' }}>
                {tasksByStatus[status].length}
              </span>
            </div>

            <div className="space-y-3 min-h-20">
              {tasksByStatus[status].length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed"
                  style={{ borderColor: 'var(--app-border)', color: 'var(--app-muted)' }}>
                  <CheckSquare className="w-6 h-6 mb-2 opacity-30" />
                  <p className="text-xs">No tasks</p>
                </div>
              ) : (
                tasksByStatus[status].map((task) => (
                  <TaskCard key={task.id} task={task} isAdmin={isAdmin}
                    onStatusChange={handleStatusChange} onDelete={handleDeleteTask} deletingId={deletingTaskId} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {showTaskModal && (
        <CreateTaskModal projectId={id} members={project?.members || []}
          onClose={() => setShowTaskModal(false)}
          onCreated={(task) => setProject((prev) => ({ ...prev, tasks: [task, ...prev.tasks] }))} />
      )}
      {showMemberModal && (
        <AddMemberModal onClose={() => setShowMemberModal(false)}
          onAdded={(member) => setProject((prev) => ({ ...prev, members: [...prev.members, member] }))} />
      )}
    </div>
  )
}

export default ProjectDetail