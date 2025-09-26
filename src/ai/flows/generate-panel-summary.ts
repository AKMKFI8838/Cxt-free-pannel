'use server';

/**
 * @fileOverview Summarizes the trends in dashboard data using AI.
 *
 * - generatePanelSummary - A function that generates a summary of panel data trends.
 * - GeneratePanelSummaryInput - The input type for the generatePanelSummary function.
 * - GeneratePanelSummaryOutput - The return type for the generatePanelSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePanelSummaryInputSchema = z.object({
  panelData: z.string().describe('The data from the dashboard panel, in JSON format.'),
  panelDescription: z.string().describe('The description of the panel.'),
});
export type GeneratePanelSummaryInput = z.infer<typeof GeneratePanelSummaryInputSchema>;

const GeneratePanelSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the trends in the panel data.'),
});
export type GeneratePanelSummaryOutput = z.infer<typeof GeneratePanelSummaryOutputSchema>;

export async function generatePanelSummary(input: GeneratePanelSummaryInput): Promise<GeneratePanelSummaryOutput> {
  return generatePanelSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePanelSummaryPrompt',
  input: {schema: GeneratePanelSummaryInputSchema},
  output: {schema: GeneratePanelSummaryOutputSchema},
  prompt: `You are an expert data analyst specializing in summarizing trends in dashboard data.  You will be given data from a dashboard panel, and you will generate a concise summary of the trends in the data.

Panel Description: {{{panelDescription}}}

Panel Data: {{{panelData}}}

Summary: `,
});

const generatePanelSummaryFlow = ai.defineFlow(
  {
    name: 'generatePanelSummaryFlow',
    inputSchema: GeneratePanelSummaryInputSchema,
    outputSchema: GeneratePanelSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
