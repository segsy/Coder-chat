export const outlinePrompt = (prompt: string) => `
You are an expert course designer.

Create a complete educational course from this topic:
"${prompt}"

Return STRICT JSON only in this format:
{
  "title": "",
  "chapters": [
    {
      "title": "",
      "lessons": [
        { "title": "" }
      ]
    }
  ]
}
`;

export const coursePlannerPrompt = (prompt: string) => `
You are an expert instructional designer.

Create a structured course outline from this prompt:
"${prompt}"

Return JSON ONLY in this format:
{
  "title": "",
  "lessons": [
    { "title": "" }
  ]
}
`;

export const lessonScriptPrompt = (lesson: string, course: string) => `
You are an expert teacher.

Write a clear, video-ready lesson script for:
Lesson: "${lesson}"
Course: "${course}"

Include examples and explanations.
`;

export const narrationPrompt = (script: string) => `
Convert the following script into natural voiceover narration:

${script}
`;
