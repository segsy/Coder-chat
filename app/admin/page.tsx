'use client';

import { useState } from 'react';
import { Sparkles, Users, CreditCard, Globe, Code, Image, TrendingUp, DollarSign, Activity } from 'lucide-react';

// Demo analytics data
const analyticsData = {
  totalProjects: 156,
  totalGenerations: 1247,
  activeUsers: 89,
  revenue: 12450,
  imagesTransformed: 567,
  codeExports: 342,
};

const recentProjects = [
  { id: '1', name: 'SaaS Landing Page', user: 'john@example.com', status: 'published', date: '2 hours ago' },
  { id: '2', name: 'Ecommerce Store', user: 'jane@example.com', status: 'draft', date: '5 hours ago' },
  { id: '3', name: 'Portfolio Site', user: 'bob@example.com', status: 'published', date: '1 day ago' },
  { id: '4', name: 'Blog Template', user: 'alice@example.com', status: 'draft', date: '2 days ago' },
];

const stats = [
  { 
    label: 'Total Projects', 
    value: analyticsData.totalProjects.toLocaleString(), 
    change: '+12%', 
    icon: Globe,
    color: 'purple'
  },
  { 
    label: 'AI Generations', 
    value: analyticsData.totalGenerations.toLocaleString(), 
    change: '+28%', 
    icon: Sparkles,
    color: 'indigo'
  },
  { 
    label: 'Active Users', 
    value: analyticsData.activeUsers.toLocaleString(), 
    change: '+8%', 
    icon: Users,
    color: 'blue'
  },
  { 
    label: 'Revenue', 
    value: `$${analyticsData.revenue.toLocaleString()}`, 
    change: '+15%', 
    icon: DollarSign,
    color: 'green'
  },
];

const featureStats = [
  { label: 'Images Transformed', value: analyticsData.imagesTransformed, icon: Image, color: 'purple' },
  { label: 'Code Exports', value: analyticsData.codeExports, icon: Code, color: 'indigo' },
];

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState('7d');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">magicAI Admin</span>
          </div>
          
          <div className="flex items-center gap-4">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
          <p className="mt-2 text-muted-foreground">
            Monitor your AI Website Generator platform performance
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group relative rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:bg-white/[0.05] transition-all"
            >
              <div className="flex items-center justify-between">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-${stat.color}-500/20`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-400`} />
                </div>
                <span className="flex items-center gap-1 text-sm font-medium text-green-400">
                  <TrendingUp className="h-3 w-3" />
                  {stat.change}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Stats */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {featureStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
            >
              <div className="flex items-center gap-4">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-${stat.color}-500/20`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-400`} />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stat.value.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Projects Table */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="border-b border-white/10 p-6">
            <h2 className="text-xl font-semibold">Recent Projects</h2>
            <p className="text-sm text-muted-foreground">Latest website generation projects</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Project</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">User</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Created</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map((project) => (
                  <tr key={project.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                          <Globe className="h-5 w-5 text-purple-400" />
                        </div>
                        <span className="font-medium">{project.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{project.user}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        project.status === 'published' 
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${
                          project.status === 'published' ? 'bg-green-400' : 'bg-yellow-400'
                        }`} />
                        {project.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{project.date}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-sm text-purple-400 hover:text-purple-300">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
              <Activity className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="font-semibold">System Health</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              All systems operational. API latency: 124ms
            </p>
          </div>
          
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
              <CreditCard className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="font-semibold">Active Subscriptions</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              23 Pro subscriptions • 2 Enterprise
            </p>
          </div>
          
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
              <Users className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="font-semibold">User Growth</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              +45 new users this week
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
