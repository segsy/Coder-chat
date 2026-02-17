import React from 'react';
import { AbsoluteFill, Audio, Sequence, useVideoConfig } from 'remotion';

export type CourseVideoProps = {
  title: string;
  lessonTitles: string[];
  audioSrcs: string[];
};

export const CourseVideo: React.FC<CourseVideoProps> = ({ title, lessonTitles, audioSrcs }) => {
  const { fps } = useVideoConfig();
  const secondsPerLesson = 6;
  const framesPerLesson = secondsPerLesson * fps;

  return (
    <AbsoluteFill style={{ backgroundColor: 'white', padding: 80 }}>
      <div style={{ fontSize: 64, fontWeight: 800, marginBottom: 24 }}>{title}</div>

      {lessonTitles.map((lessonTitle, index) => (
        <Sequence key={lessonTitle} from={index * framesPerLesson} durationInFrames={framesPerLesson}>
          <div style={{ fontSize: 42, fontWeight: 700, marginTop: 24 }}>
            {index + 1}. {lessonTitle}
          </div>
          {audioSrcs[index] ? <Audio src={audioSrcs[index]} /> : null}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
