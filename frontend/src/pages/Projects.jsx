import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProjects, createProject, deleteProject } from '../api/projects'
import useTitle from '../hooks/useTitle'
import { FolderKanban, Plus, Trash2, Users, CheckSquare, Loader, X } from 'lucide-react'
import toast from 'react-hot-toast'

const CreateProjectModal = ({ onClose, onCreated }) => {
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return setError('Project name is required')
    setLoading(true)
    try {
      const res = await createProject(formData)
      onCreated(res.data.data)
      toast.success('Project created!')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-md rounded-xl shadow-2xl"
        style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--app-border)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--app-text)' }}>New Project</p>
          <button onClick={onClose} style={{ color: 'var(--app-muted)' }} className="hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-widest"
              style={{ color: 'var(--app-muted)' }}>Project Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setError('') }}
              placeholder="e.g. Marketing Campaign"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
              style={{
                background: 'var(--app-bg)',
                border: `1px solid ${error ? '#ef4444' : 'var(--app-border)'}`,
                color: 'var(--app-text)',
              }}
            />
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-widest"
              style={{ color: 'var(--app-muted)' }}>Description (optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What is this project about?"
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none transition-all"
              style={{ background: 'var(--app-bg)', border: '1px solid var(--app-border)', color: 'var(--app-text)' }}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: 'var(--app-hover)', color: 'var(--app-muted)', border: '1px solid var(--app-border)' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-lg text-xs font-semibold text-white transition-all flex items-center justify-center gap-1.5"
              style={{ background: 'var(--app-accent)' }}>
              {loading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Projects = () => {
  useTitle('Projects')
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    getProjects()
      .then((res) => setProjects(res.data.data))
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return
    setDeletingId(id)
    try {
      await deleteProject(id)
      setProjects(projects.filter((p) => p.id !== id))
      toast.success('Project deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <div className="h-7 w-32 rounded animate-pulse" style={{ background: 'var(--app-surface)' }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 rounded-xl animate-pulse" style={{ background: 'var(--app-surface)' }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--app-text)' }}>Projects</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--app-muted)' }}>
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--app-accent)' }}
          >
            <Plus className="w-3.5 h-3.5" /> New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24" style={{ color: 'var(--app-muted)' }}>
          <FolderKanban className="w-12 h-12 mb-3 opacity-20" />
          <p className="font-semibold text-sm" style={{ color: 'var(--app-text)' }}>No projects yet</p>
          <p className="text-xs mt-1">
            {user?.role === 'ADMIN' ? 'Create your first project to get started' : 'You have not been added to any project'}
          </p>
          {user?.role === 'ADMIN' && (
            <button onClick={() => setShowModal(true)}
              className="mt-4 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90"
              style={{ background: 'var(--app-accent)' }}>
              <Plus className="w-3.5 h-3.5" /> Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="rounded-xl p-5 group transition-all hover:scale-[1.01]"
              style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(35,131,226,0.1)' }}>
                  <FolderKanban className="w-4 h-4" style={{ color: 'var(--app-accent)' }} />
                </div>
                {project.createdById === user?.id && (
                  <button
                    onClick={() => handleDelete(project.id)}
                    disabled={deletingId === project.id}
                    className="opacity-0 group-hover:opacity-100 transition-all hover:text-red-400"
                    style={{ color: 'var(--app-muted)' }}
                  >
                    {deletingId === project.id
                      ? <Loader className="w-3.5 h-3.5 animate-spin" />
                      : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              <Link to={`/projects/${project.id}`}>
                <h3 className="font-semibold text-sm mb-1 hover:underline transition-colors"
                  style={{ color: 'var(--app-text)' }}>
                  {project.name}
                </h3>
              </Link>
              <p className="text-xs line-clamp-2 mb-4" style={{ color: 'var(--app-muted)' }}>
                {project.description || 'No description'}
              </p>

              <div className="flex items-center gap-4 pt-3 text-xs"
                style={{ borderTop: '1px solid var(--app-border)', color: 'var(--app-muted)' }}>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> {project.members?.length ?? 0} members
                </span>
                <span className="flex items-center gap-1">
                  <CheckSquare className="w-3 h-3" /> {project._count?.tasks ?? 0} tasks
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreated={(p) => setProjects([p, ...projects])}
        />
      )}
    </div>
  )
}

export default Projects