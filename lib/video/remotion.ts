import { getRenderProgress, renderMediaOnLambda } from '@remotion/lambda/client';

export async function startLambdaRender(input: {
  title: string;
  lessonTitles: string[];
  audioSrcs: string[];
  outName: string;
}) {
  const serveUrl = process.env.REMOTION_SERVE_URL;
  const functionName = process.env.REMOTION_FUNCTION_NAME;
  const region = process.env.REMOTION_REGION || process.env.AWS_REGION;

  if (!serveUrl || !functionName || !region) {
    throw new Error('Remotion Lambda env vars are missing.');
  }

  return renderMediaOnLambda({
    region,
    functionName,
    serveUrl,
    composition: process.env.REMOTION_COMPOSITION_ID || 'CourseVideo',
    codec: 'h264',
    inputProps: {
      title: input.title,
      lessonTitles: input.lessonTitles,
      audioSrcs: input.audioSrcs
    },
    outName: input.outName,
    privacy: 'public',
    downloadBehavior: {
      type: 'play-in-browser'
    }
  });
}

export async function getLambdaRenderProgress(renderId: string) {
  const functionName = process.env.REMOTION_FUNCTION_NAME;
  const region = process.env.REMOTION_REGION || process.env.AWS_REGION;
  const bucketName = process.env.REMOTION_BUCKET_NAME;

  if (!functionName || !region || !bucketName) {
    throw new Error('Remotion progress env vars are missing.');
  }

  return getRenderProgress({
    renderId,
    functionName,
    region,
    bucketName
  });
}
