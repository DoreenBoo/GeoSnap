'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting relevant tags for photos based on their content.
 *
 * - suggestPhotoTags - A function that takes a photo as input and returns a list of suggested tags.
 * - SuggestPhotoTagsInput - The input type for the suggestPhotoTags function.
 * - SuggestPhotoTagsOutput - The return type for the suggestPhotoTags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPhotoTagsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
});
export type SuggestPhotoTagsInput = z.infer<typeof SuggestPhotoTagsInputSchema>;

const SuggestPhotoTagsOutputSchema = z.object({
  tags: z.array(z.string()).describe('A list of suggested tags for the photo.'),
});
export type SuggestPhotoTagsOutput = z.infer<typeof SuggestPhotoTagsOutputSchema>;

export async function suggestPhotoTags(input: SuggestPhotoTagsInput): Promise<SuggestPhotoTagsOutput> {
  return suggestPhotoTagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPhotoTagsPrompt',
  input: {schema: SuggestPhotoTagsInputSchema},
  output: {schema: SuggestPhotoTagsOutputSchema},
  prompt: `You are an expert AI tagger.

  Analyze the image provided and suggest relevant tags for it.
  Return ONLY the tags in the array.

  Image: {{media url=photoDataUri}}`,
});

const suggestPhotoTagsFlow = ai.defineFlow(
  {
    name: 'suggestPhotoTagsFlow',
    inputSchema: SuggestPhotoTagsInputSchema,
    outputSchema: SuggestPhotoTagsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
