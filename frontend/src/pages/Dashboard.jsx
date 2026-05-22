import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDashboardStats } from '../api/dashboard'
import useTitle from '../hooks/useTitle'
import { ArrowRight, TrendingUp, Clock, AlertTriangle, FolderKanban, CheckSquare } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const DonutChart = ({ data, colors, centerValue, centerLabel }) => (
  <div className="relative w-32 h-32">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%" cy="50%"
          innerRadius={42} outerRadius={58}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: 'var(--app-surface)',
            border: '1px solid var(--app-border)',
            borderRadius: 8,
            fontSize: 11,
            color: 'var(--app-text)'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <p className="text-2xl font-black" style={{ color: 'var(--app-text)' }}>{centerValue}</p>
      <p className="text-xs" style={{ color: 'var(--app-muted)' }}>{centerLabel}</p>
    </div>
  </div>
)

const BigStatCard = ({ label, value, color, icon: Icon }) => (
  <div className="rounded-xl p-5 flex flex-col justify-between"
    style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--app-muted)' }}>{label}</p>
      {Icon && <Icon className="w-4 h-4" style={{ color }} />}
    </div>
    <p className="text-5xl font-black" style={{ color }}>{value}</p>
  </div>
)

const statusColors = {
  TODO: { background: 'var(--app-hover)', color: 'var(--app-muted)' },
  IN_PROGRESS: { background: 'rgba(35,131,226,0.15)', color: '#2383e2' },
  DONE: { background: 'rgba(34,197,94,0.15)', color: '#22c55e' },
}

const priorityColors = {
  LOW: '#9b9b9b',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444',
}

const Dashboard = () => {
  useTitle('Dashboard')
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats()
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl animate-pulse" style={{ background: 'var(--app-surface)' }} />
        ))}
      </div>
    )
  }

  const stats = data?.stats || {}
  const recentTasks = data?.recentTasks || []

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const taskPieData = [
    { name: 'To Do', value: stats.todoTasks || 0 },
    { name: 'In Progress', value: stats.inProgressTasks || 0 },
    { name: 'Done', value: stats.doneTasks || 0 },
  ]
  const taskPieColors = ['#9b9b9b', '#2383e2', '#22c55e']

  const overduePieData = [
    { name: 'Overdue', value: stats.overdueTasks || 0 },
    { name: 'On Track', value: Math.max(0, (stats.totalTasks || 0) - (stats.overdueTasks || 0)) },
  ]
  const overduePieColors = ['#ef4444', '#373737']

  return (
    <div className="space-y-6 max-w-6xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: 'var(--app-muted)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-3xl font-black" style={{ color: 'var(--app-text)' }}>
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
        </div>
        <Link to="/projects"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white"
          style={{ background: 'var(--app-accent)' }}>
          <FolderKanban className="w-3.5 h-3.5" /> View Projects
        </Link>
      </div>

      {/* Top Row — Big Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <BigStatCard label="Total Projects" value={stats.totalProjects ?? 0} color="#2383e2" icon={FolderKanban} />
        <BigStatCard label="Total Tasks" value={stats.totalTasks ?? 0} color="#7c3aed" icon={CheckSquare} />
        <BigStatCard label="Overdue" value={stats.overdueTasks ?? 0} color="#ef4444" icon={AlertTriangle} />
        <BigStatCard label="Completed" value={stats.doneTasks ?? 0} color="#22c55e" icon={TrendingUp} />
      </div>

      {/* Middle Row — Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Task Status Donut */}
        <div className="rounded-xl p-5" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: 'var(--app-muted)' }}>
            Task Status Summary
          </p>
          <div className="flex items-center gap-6">
            <DonutChart
              data={taskPieData}
              colors={taskPieColors}
              centerValue={stats.totalTasks ?? 0}
              centerLabel="Total"
            />
            <div className="space-y-3">
              {taskPieData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: taskPieColors[i] }} />
                  <div>
                    <p className="text-xs" style={{ color: 'var(--app-muted)' }}>{item.name}</p>
                    <p className="text-sm font-black" style={{ color: 'var(--app-text)' }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* My Pending Tasks */}
        <div className="rounded-xl p-5" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: 'var(--app-muted)' }}>
            My Pending Tasks
          </p>
          <div className="flex items-center gap-6">
            <DonutChart
              data={[
                { name: 'My Tasks', value: stats.myTasks || 0 },
                { name: 'Others', value: Math.max(0, (stats.totalTasks || 0) - (stats.myTasks || 0)) },
              ]}
              colors={['#2383e2', '#373737']}
              centerValue={stats.myTasks ?? 0}
              centerLabel="Mine"
            />
            <div>
              <p className="text-4xl font-black mb-1" style={{ color: '#2383e2' }}>{stats.myTasks ?? 0}</p>
              <p className="text-xs mb-4" style={{ color: 'var(--app-muted)' }}>tasks assigned to you</p>
              <Link to="/tasks" className="flex items-center gap-1 text-xs font-bold hover:underline"
                style={{ color: 'var(--app-accent)' }}>
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Overdue Donut */}
        <div className="rounded-xl p-5"
          style={{
            background: stats.overdueTasks > 0 ? 'rgba(239,68,68,0.05)' : 'rgba(34,197,94,0.05)',
            border: `1px solid ${stats.overdueTasks > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
          }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: 'var(--app-muted)' }}>
            Overdue Status
          </p>
          <div className="flex items-center gap-6">
            <DonutChart
              data={overduePieData}
              colors={overduePieColors}
              centerValue={stats.overdueTasks ?? 0}
              centerLabel="Overdue"
            />
            <div>
              {stats.overdueTasks > 0 ? (
                <>
                  <p className="text-4xl font-black text-red-400">{stats.overdueTasks}</p>
                  <p className="text-xs text-red-400 mt-1">tasks overdue</p>
                </>
              ) : (
                <>
                  <p className="text-4xl font-black text-green-400">✓</p>
                  <p className="text-xs text-green-400 mt-1">All caught up!</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Breakdown Progress */}
      <div className="rounded-xl p-5" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--app-muted)' }}>
            Progress Overview
          </p>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(35,131,226,0.1)', color: '#2383e2' }}>
            {stats.totalTasks > 0 ? Math.round(((stats.doneTasks || 0) / stats.totalTasks) * 100) : 0}% Complete
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[
            { label: 'To Do', value: stats.todoTasks ?? 0, color: '#9b9b9b' },
            { label: 'In Progress', value: stats.inProgressTasks ?? 0, color: '#2383e2' },
            { label: 'Done', value: stats.doneTasks ?? 0, color: '#22c55e' },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-xs mb-2">
                <span className="font-bold" style={{ color: item.color }}>{item.label}</span>
                <span className="font-black" style={{ color: 'var(--app-text)' }}>{item.value}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--app-hover)' }}>
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: stats.totalTasks ? `${Math.round((item.value / stats.totalTasks) * 100)}%` : '0%',
                    background: item.color,
                  }}
                />
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--app-muted)' }}>
                {stats.totalTasks ? Math.round((item.value / stats.totalTasks) * 100) : 0}% of total
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--app-border)' }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--app-muted)' }}>
            Recent Tasks
          </p>
          <Link to="/tasks" className="flex items-center gap-1 text-xs font-bold hover:underline"
            style={{ color: 'var(--app-accent)' }}>
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14" style={{ color: 'var(--app-muted)' }}>
            <CheckSquare className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm font-bold" style={{ color: 'var(--app-text)' }}>No tasks yet</p>
            <p className="text-xs mt-1">Create a project to get started</p>
          </div>
        ) : (
          <div>
            {/* Table Header */}
            <div className="grid grid-cols-4 px-5 py-2"
              style={{ background: 'var(--app-hover)', borderBottom: '1px solid var(--app-border)' }}>
              {['Task', 'Project', 'Priority', 'Status'].map((h) => (
                <p key={h} className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--app-muted)' }}>{h}</p>
              ))}
            </div>
            {recentTasks.map((task, i) => (
              <div key={task.id}
                className="grid grid-cols-4 px-5 py-3 transition-colors"
                style={{ borderBottom: i < recentTasks.length - 1 ? '1px solid var(--app-border)' : 'none' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--app-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <p className="text-sm font-semibold" style={{ color: 'var(--app-text)' }}>{task.title}</p>
                <p className="text-xs flex items-center" style={{ color: 'var(--app-muted)' }}>{task.project?.name}</p>
                <p className="text-xs flex items-center font-bold" style={{ color: priorityColors[task.priority] }}>
                  {task.priority}
                </p>
                <span className="text-xs px-2 py-0.5 rounded font-bold w-fit flex items-center" style={statusColors[task.status]}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
