import { Course } from '@/lib/course-types';

const courseStore = new Map<string, Course>();

export const saveCourse = (course: Course) => {
  courseStore.set(course.id, course);
  return course;
};

export const listCourses = () => Array.from(courseStore.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const getCourse = (courseId: string) => courseStore.get(courseId);
