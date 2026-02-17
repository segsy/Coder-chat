import { SiteHeader } from '@/components/marketing/site-header';

const sampleCourses = [
  { title: 'React for Beginners', status: 'ready', lessons: 8 },
  { title: 'Next.js SaaS Fundamentals', status: 'draft', lessons: 5 },
  { title: 'TypeScript Essentials', status: 'ready', lessons: 6 }
];

export default function MyCoursesPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <p className="mt-2 text-slate-600">Browse generated courses, progress, and publishing state.</p>

        <div className="mt-6 space-y-3">
          {sampleCourses.map((course) => (
            <article key={course.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="font-medium">{course.title}</p>
                <span className={`rounded-full px-2 py-1 text-xs ${course.status === 'ready' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {course.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{course.lessons} lessons</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
