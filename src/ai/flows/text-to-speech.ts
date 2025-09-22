'use server';

/**
 * @fileOverview This file defines a Genkit flow for converting text to speech.
 *
 * - `textToSpeech` - A function that takes text and a language code, and returns audio.
 * - `TextToSpeechInput` - The input type for the `textToSpeech` function.
 * - `TextToSpeechOutput` - The return type for the `textToSpeech` function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';
import {googleAI} from '@genkit-ai/googleai';


const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
  languageCode: z.string().default('en-US').describe('The language code for the speech (e.g., en-US, kn-IN).'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
    audioDataUri: z.string().describe("The generated audio as a data URI in WAV format.")
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(input);
}


async function toWav(
    pcmData: Buffer,
    channels = 1,
    rate = 24000,
    sampleWidth = 2
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const writer = new wav.Writer({
        channels,
        sampleRate: rate,
        bitDepth: sampleWidth * 8,
      });
  
      let bufs = [] as any[];
      writer.on('error', reject);
      writer.on('data', function (d) {
        bufs.push(d);
      });
      writer.on('end', function () {
        resolve(Buffer.concat(bufs).toString('base64'));
      });
  
      writer.write(pcmData);
      writer.end();
    });
}

const textToSpeechFlow = ai.defineFlow(
    {
      name: 'textToSpeechFlow',
      inputSchema: TextToSpeechInputSchema,
      outputSchema: TextToSpeechOutputSchema,
    },
    async (input) => {
        const { media } = await ai.generate({
            model: googleAI.model('gemini-2.5-flash-preview-tts'),
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  languageCode: input.languageCode,
                },
              },
            },
            prompt: input.text,
          });

      if (!media) {
        throw new Error('No audio was generated.');
      }

      const audioBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
      );

      const wavBase64 = await toWav(audioBuffer);
      
      return {
        audioDataUri: 'data:audio/wav;base64,' + wavBase64,
      };
    }
);
