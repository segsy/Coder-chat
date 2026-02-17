import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

export async function synthesizeMp3(text: string) {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  const voice = process.env.AZURE_SPEECH_VOICE || 'en-US-JennyNeural';

  if (!key || !region) {
    throw new Error('Azure Speech env vars are missing.');
  }

  const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
  speechConfig.speechSynthesisVoiceName = voice;
  speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

  const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

  return await new Promise<Buffer>((resolve, reject) => {
    synthesizer.speakTextAsync(
      text,
      (result) => {
        synthesizer.close();
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          resolve(Buffer.from(result.audioData));
        } else {
          reject(new Error(result.errorDetails || 'TTS failed'));
        }
      },
      (error) => {
        synthesizer.close();
        reject(error);
      }
    );
  });
}
