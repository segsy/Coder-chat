'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Plus, Loader2, GraduationCap, Video, FileText, Clock, ChevronRight } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  prompt: string;
  status: string;
  createdAt: string;
  _count?: {
    chapters: number;
    lessons: number;
  };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  
  // Form state
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      setCourses(data.courses || []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!title.trim() || title.length < 3) {
      setError('Title must be at least 3 characters');
      return;
    }
    if (!prompt.trim() || prompt.length < 20) {
      setError('Prompt must be at least 20 characters');
      return;
    }

    setIsCreating(true);

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, prompt })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create course');
        return;
      }

      // Clear form and refresh list
      setTitle('');
      setPrompt('');
      startTransition(() => {
        router.refresh();
        fetchCourses();
      });
      
      if (data.courseId) {
        router.push(`/dashboard/courses/${data.courseId}`);
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      generating: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      ready: 'bg-green-500/20 text-green-400 border-green-500/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${styles[status] || styles.draft}`}>
        <div className={`h-1.5 w-1.5 rounded-full ${
          status === 'ready' ? 'bg-green-400' : 
          status === 'generating' ? 'bg-blue-400' : 
          status === 'failed' ? 'bg-red-400' : 'bg-yellow-400'
        }`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                VidCourse
              </span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">Courses</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">My Courses</h1>
          <p className="mt-2 text-muted-foreground">
            Create and manage AI-generated video courses
          </p>
        </div>

        {/* Create New Course Form */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Course
          </h2>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Course Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., React for Beginners"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Topic / Prompt
                </label>
                <input
                  id="prompt"
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Learn React from scratch to advanced patterns"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
            
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isCreating || !title.trim() || !prompt.trim()}
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
                  Create Course
                </>
              )}
            </button>
          </form>
        </div>

        {/* Courses List */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">All Courses ({courses.length})</h2>
        </div>

        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-20">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10">
              <BookOpen className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">No courses yet</h3>
            <p className="mb-6 text-center text-muted-foreground">
              Create your first AI-generated video course
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/dashboard/courses/${course.id}`}
                className="group relative rounded-xl border border-white/10 bg-white/[0.02] p-5 hover:bg-white/[0.05] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                        <BookOpen className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white truncate">{course.title}</h3>
                        <p className="text-sm text-muted-foreground truncate max-w-md">
                          {course.prompt}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {getStatusBadge(course.status)}
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-white transition-colors" />
                  </div>
                </div>

                {/* Course Stats */}
                <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                  </div>
                  {course._count && (
                    <>
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-4 w-4" />
                        <span>{course._count.chapters} chapters</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Video className="h-4 w-4" />
                        <span>{course._count.lessons} lessons</span>
                      </div>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}