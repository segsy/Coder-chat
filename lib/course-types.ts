export type CourseLesson = {
  id: string;
  title: string;
  objective: string;
  script: string;
  narration: string;
  videoPrompt: string;
};

export type CourseChapter = {
  id: string;
  title: string;
  summary: string;
  lessons: CourseLesson[];
};

export type Course = {
  id: string;
  userId: string;
  title: string;
  topic: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'ready';
  qaStatus: 'pass' | 'revise';
  createdAt: string;
  chapters: CourseChapter[];
};
