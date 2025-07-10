
// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview Extracts transaction details from a Thai bank transfer slip image.
 *
 * - extractTransactionDetails - A function that handles the extraction of transaction details from an image.
 * - ExtractTransactionDetailsInput - The input type for the extractTransactionDetails function.
 * - ExtractTransactionDetailsOutput - The return type for the extractTransactionDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractTransactionDetailsInputSchema = z.object({
  slipDataUri: z
    .string()
    .describe(
      "A Thai bank transfer slip image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractTransactionDetailsInput = z.infer<typeof ExtractTransactionDetailsInputSchema>;

const ExtractTransactionDetailsOutputSchema = z.object({
  accountNumber: z.string().describe('The account number of the transaction.'),
  purpose: z.string().optional().describe('The purpose of the transaction.'),
  amount: z.number().describe('The amount of the transaction.'),
  date: z.string().describe('The date of the transaction in ISO format (YYYY-MM-DD).'),
  sender: z.string().optional().describe("The sender's name."),
  recipient: z.string().optional().describe("The recipient's name."),
});
export type ExtractTransactionDetailsOutput = z.infer<typeof ExtractTransactionDetailsOutputSchema>;

export async function extractTransactionDetails(input: ExtractTransactionDetailsInput): Promise<ExtractTransactionDetailsOutput> {
  return extractTransactionDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractTransactionDetailsPrompt',
  input: {schema: ExtractTransactionDetailsInputSchema},
  output: {schema: ExtractTransactionDetailsOutputSchema},
  prompt: `You are an expert OCR reader for Thai bank transfer slips.

You will extract the transaction details from the image provided. Please make sure to output the data in JSON format.

Considerations:
- The image will be of a Thai bank transfer slip.
- The text will be in Thai and English.
- Numbers are in Thai and English.

Extract the following information:
- Account Number: The account number of the transaction.
- Purpose: The purpose of the transaction.
- Amount: The amount of the transaction. Always output as a number.
- Date: The date of the transaction. Always output in ISO format (YYYY-MM-DD).
- Sender: The sender's name.
- Recipient: The recipient's name.

Here is the transfer slip image:

{{media url=slipDataUri}}
`,
});

const extractTransactionDetailsFlow = ai.defineFlow(
  {
    name: 'extractTransactionDetailsFlow',
    inputSchema: ExtractTransactionDetailsInputSchema,
    outputSchema: ExtractTransactionDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
