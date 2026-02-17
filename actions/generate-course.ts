'use server';

import { generateOutlineAction } from '@/actions/generate-outline';

export async function generateCourseAction(courseId: string) {
  return generateOutlineAction(courseId);
}
