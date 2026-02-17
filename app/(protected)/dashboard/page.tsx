import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import CreateCourseForm from '@/components/course/create-course-form';
import { listMyCourses } from '@/actions/create-course';
import { generateOutlineAction } from '@/actions/generate-outline';

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) return null;

  const myCourses = await listMyCourses();

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-10">
        <header>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-2 text-slate-600">Create a course from a single prompt. We save it to Neon instantly.</p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="mb-3 text-lg font-semibold">Create Course</h2>
            <CreateCourseForm />
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold">My Courses</h2>
            <div className="rounded-2xl border p-6">
              {myCourses.length === 0 ? (
                <p className="text-sm text-slate-600">No courses yet. Create your first course on the left.</p>
              ) : (
                <ul className="space-y-3">
                  {myCourses.map((course) => (
                    <li key={course.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <p className="text-xs text-slate-500">
                            Status: {course.status} • {new Date(course.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <Link href={`/dashboard/courses/${course.id}`} className="rounded-lg border px-3 py-2 text-sm">
                          Open
                        </Link>
                      </div>

                      <form
                        action={async () => {
                          "use server";
                          await generateOutlineAction(course.id);
                        }}
                        className="mt-3"
                      >
                        <button
                          type="submit"
                          disabled={course.status !== "draft"}
                          className="rounded-lg bg-black px-3 py-2 text-xs text-white disabled:opacity-50"
                        >
                          Generate Outline
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
