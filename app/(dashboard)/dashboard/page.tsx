'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/react';
import { Sparkles, Plus, Trash2, ExternalLink, Code, MoreVertical, Loader2, GraduationCap } from 'lucide-react';

// Types
interface Project {
  id: string;
  name: string;
  prompt: string;
  status: string;
  thumbnailUrl: string | null;
  creditsUsed: number;
  createdAt: string;
}

interface UserCredits {
  totalCredits: number;
  usedCredits: number;
  plan: string;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [credits, setCredits] = useState<UserCredits>({ totalCredits: 2, usedCredits: 0, plan: 'free' });
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const { isLoaded, isSignedIn } = useUser();

  // Fetch projects from database
  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        if (data.projects) {
          setProjects(data.projects);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (isLoaded && isSignedIn) {
      fetchProjects();
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    
    setIsCreating(true);
    
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName })
      });
      
      const data = await res.json();
      
      if (data.project) {
        setProjects([data.project, ...projects]);
        setNewProjectName('');
        // Redirect to workspace
        window.location.href = `/workspace/${data.project.id}`;
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const remainingCredits = credits.totalCredits - credits.usedCredits;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                magicAI
              </span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">Dashboard</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/dashboard/courses" className="flex items-center gap-2 rounded-lg bg-purple-600/20 border border-purple-500/30 px-3 py-1.5 text-sm text-purple-300 hover:bg-purple-600/30 transition-colors">
              <GraduationCap className="h-4 w-4" />
              Courses
            </Link>
            {/* Credits Display */}
            <div className="flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm text-purple-200">
                {remainingCredits} credits left
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">My Projects</h1>
          <p className="mt-2 text-muted-foreground">
            Create and manage your AI-generated websites
          </p>
        </div>

        {/* Create New Project */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="mb-4 text-lg font-semibold">Create New Project</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Enter project name... (e.g., My Landing Page)"
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-purple-500 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateProject();
                }
              }}
            />
            <button
              onClick={handleCreateProject}
              disabled={!newProjectName.trim() || isCreating}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-medium text-white disabled:opacity-50 hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Create Project
                </>
              )}
            </button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            💡 Each generation uses 1 credit. You have {remainingCredits} credits remaining.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">All Projects ({projects.length})</h2>
          <div className="flex gap-2">
            <select className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-muted-foreground">
              <option value="all">All Projects</option>
              <option value="draft">Drafts</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-20">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10">
              <Sparkles className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">No projects yet</h3>
            <p className="mb-6 text-center text-muted-foreground">
              Create your first AI-generated website project
            </p>
            <button
              onClick={() => document.querySelector('input')?.focus()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-medium text-white"
            >
              <Plus className="h-5 w-5" />
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group relative rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden hover:bg-white/[0.05] transition-all"
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-gradient-to-br from-purple-900/30 to-indigo-900/30 relative">
                  {project.thumbnailUrl ? (
                    <img 
                      src={project.thumbnailUrl} 
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Sparkles className="h-12 w-12 text-purple-500/30" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
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
                  </div>

                  {/* Actions */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="rounded-lg bg-red-500/20 p-2 text-red-400 hover:bg-red-500/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-white truncate">{project.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {project.prompt || 'No prompt yet'}
                  </p>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    <Link
                      href={`/workspace/${project.id}`}
                      className="flex items-center gap-1 text-sm font-medium text-purple-400 hover:text-purple-300"
                    >
                      Open
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
              <Code className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="mb-2 font-semibold">Export Code</h3>
            <p className="text-sm text-muted-foreground">
              Download clean React/Tailwind code for your generated websites
            </p>
          </div>
          
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20">
              <Sparkles className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="mb-2 font-semibold">AI Templates</h3>
            <p className="text-sm text-muted-foreground">
              Start with pre-built templates for common website types
            </p>
          </div>
          
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
              <Plus className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="mb-2 font-semibold">Upgrade Plan</h3>
            <p className="text-sm text-muted-foreground">
              Get more credits and premium features
            </p>
            <Link 
              href="/pricing" 
              className="mt-4 inline-block text-sm font-medium text-purple-400 hover:text-purple-300"
            >
              View Pricing →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
