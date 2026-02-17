import React from 'react';
import { Composition } from 'remotion';
import { CourseVideo, type CourseVideoProps } from './CourseVideo';

export const RemotionRoot: React.FC = () => {
  const defaultProps: CourseVideoProps = {
    title: 'My AI Course',
    lessonTitles: ['Intro', 'Core Concepts', 'Summary'],
    audioSrcs: []
  };

  return (
    <Composition
      id="CourseVideo"
      component={CourseVideo}
      durationInFrames={30 * 18}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={defaultProps}
    />
  );
};
