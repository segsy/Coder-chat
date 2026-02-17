import { randomUUID } from 'crypto';
import {
  AGENT_SYSTEM_BASE,
  LessonScriptOutput,
  NarrationOutput,
  OutlineOutput,
  QaOutput,
  lessonScriptPrompt,
  lessonScriptSchema,
  narrationPrompt,
  narrationSchema,
  outlinePrompt,
  outlineSchema,
  qaPrompt,
  qaSchema,
  repairPrompt
} from '@/lib/ai/agent-architecture';
import { AgentRunner } from '@/lib/ai/agent-runner';
import { Course, CourseChapter, CourseLesson } from '@/lib/course-types';

const toLevel = (input?: string): Course['level'] => {
  if (input === 'intermediate' || input === 'advanced') {
    return input;
  }

  return 'beginner';
};

const summarizeScriptForStorage = (script: LessonScriptOutput) =>
  script.script.map((line) => `${line.type.toUpperCase()}: ${line.text}`).join('\n\n');

const buildVideoPrompt = (lesson: OutlineOutput['chapters'][number]['lessons'][number], chapterTitle: string) =>
  `Create a clean educational visual sequence for ${lesson.title} in chapter ${chapterTitle}. Cover concepts: ${lesson.keyConcepts.join(', ')}.`;

const runAgenticPipeline = async ({
  prompt,
  level
}: {
  prompt: string;
  level: Course['level'];
}): Promise<{
  outline: OutlineOutput;
  scripts: Map<string, LessonScriptOutput>;
  narrations: Map<string, NarrationOutput>;
  qa: QaOutput;
  usageTokens: number;
}> => {
  const runner = new AgentRunner();

  const outlineResult = await runner.run({
    agentName: 'outline',
    systemPrompt: `${AGENT_SYSTEM_BASE}\n\n${outlinePrompt}`,
    input: { topicPrompt: prompt, requestedLevel: level },
    schema: outlineSchema,
    maxRepairAttempts: 2
  });

  const scripts = new Map<string, LessonScriptOutput>();
  const narrations = new Map<string, NarrationOutput>();
  let usageTokens = outlineResult.usage.totalTokens;

  for (const chapter of outlineResult.output.chapters) {
    for (const lesson of chapter.lessons) {
      const scriptResult = await runner.run({
        agentName: 'lesson_script',
        systemPrompt: `${AGENT_SYSTEM_BASE}\n\n${lessonScriptPrompt}`,
        input: {
          courseTitle: outlineResult.output.title,
          level: outlineResult.output.level,
          chapterTitle: chapter.title,
          lessonTitle: lesson.title,
          lessonGoal: lesson.lessonGoal,
          keyConcepts: lesson.keyConcepts,
          projectOrExercise: lesson.projectOrExercise
        },
        schema: lessonScriptSchema,
        maxRepairAttempts: 2
      });

      scripts.set(lesson.title, scriptResult.output);
      usageTokens += scriptResult.usage.totalTokens;

      const narrationResult = await runner.run({
        agentName: 'narration',
        systemPrompt: `${AGENT_SYSTEM_BASE}\n\n${narrationPrompt}`,
        input: scriptResult.output,
        schema: narrationSchema,
        maxRepairAttempts: 2
      });

      narrations.set(lesson.title, narrationResult.output);
      usageTokens += narrationResult.usage.totalTokens;
    }
  }

  const qaResult = await runner.run({
    agentName: 'qa',
    systemPrompt: `${AGENT_SYSTEM_BASE}\n\n${qaPrompt}\n\n${repairPrompt}`,
    input: {
      outline: outlineResult.output,
      scripts: Array.from(scripts.values())
    },
    schema: qaSchema,
    maxRepairAttempts: 1
  });

  usageTokens += qaResult.usage.totalTokens;

  return {
    outline: outlineResult.output,
    scripts,
    narrations,
    qa: qaResult.output,
    usageTokens
  };
};

const fallbackCourse = ({ prompt, userId, level }: { prompt: string; userId: string; level: Course['level'] }): Course => ({
  id: randomUUID(),
  userId,
  title: `${prompt} Masterclass`,
  topic: prompt,
  description: `A structured, AI-generated video course about ${prompt}, from fundamentals to deployment.`,
  level,
  status: 'ready',
  qaStatus: 'pass',
  createdAt: new Date().toISOString(),
  chapters: [
    {
      id: randomUUID(),
      title: 'Chapter 1: Foundations',
      summary: `Understand the core principles behind ${prompt}.`,
      lessons: [
        {
          id: randomUUID(),
          title: 'Lesson 1.1: Core Concepts',
          objective: `Identify the essential concepts for ${prompt}.`,
          script: `Welcome to ${prompt}. In this lesson we cover fundamentals, context, and why this topic matters in real applications.`,
          narration: 'Explain terms slowly, then bridge to one practical scenario and a concise recap.',
          videoPrompt: `Animated explainer with title cards and icons for ${prompt} fundamentals.`
        },
        {
          id: randomUUID(),
          title: 'Lesson 1.2: Practical Setup',
          objective: `Set up the environment and workflow for ${prompt}.`,
          script: `We set up tools, dependencies, and a starter project to create repeatable learning momentum.`,
          narration: 'Use a step-by-step voiceover pacing and emphasize each setup checkpoint.',
          videoPrompt: 'Screen recording sequence showing setup commands and starter project structure.'
        }
      ]
    }
  ]
});

const toCourseChapter = ({
  chapter,
  scripts,
  narrations
}: {
  chapter: OutlineOutput['chapters'][number];
  scripts: Map<string, LessonScriptOutput>;
  narrations: Map<string, NarrationOutput>;
}): CourseChapter => ({
  id: randomUUID(),
  title: chapter.title,
  summary: chapter.learningGoal,
  lessons: chapter.lessons.map((lesson): CourseLesson => {
    const script = scripts.get(lesson.title);
    const narration = narrations.get(lesson.title);

    return {
      id: randomUUID(),
      title: lesson.title,
      objective: lesson.lessonGoal,
      script: script ? summarizeScriptForStorage(script) : `Teach ${lesson.title} with practical examples and a recap.`,
      narration: narration?.narration ?? `Narrate ${lesson.title} with short pacing and beginner-friendly language.`,
      videoPrompt: buildVideoPrompt(lesson, chapter.title)
    };
  })
});

export async function generateCoursePlan({
  prompt,
  level,
  userId = 'demo-user'
}: {
  prompt: string;
  level?: string;
  userId?: string;
}): Promise<Course> {
  const normalizedLevel = toLevel(level);

  if (!process.env.AZURE_OPENAI_ENDPOINT || !process.env.AZURE_OPENAI_API_KEY || !process.env.AZURE_OPENAI_DEPLOYMENT) {
    return fallbackCourse({ prompt, userId, level: normalizedLevel });
  }

  try {
    const pipeline = await runAgenticPipeline({
      prompt,
      level: normalizedLevel
    });

    return {
      id: randomUUID(),
      userId,
      title: pipeline.outline.title,
      topic: prompt,
      description: `A ${pipeline.outline.level} course for ${pipeline.outline.targetAudience}. Estimated duration: ${pipeline.outline.estimatedDurationMinutes} minutes.`,
      level: pipeline.outline.level,
      status: 'ready',
      qaStatus: pipeline.qa.accept ? 'pass' : 'revise',
      createdAt: new Date().toISOString(),
      chapters: pipeline.outline.chapters.map((chapter) =>
        toCourseChapter({
          chapter,
          scripts: pipeline.scripts,
          narrations: pipeline.narrations
        })
      )
    };
  } catch {
    return fallbackCourse({ prompt, userId, level: normalizedLevel });
  }
}
