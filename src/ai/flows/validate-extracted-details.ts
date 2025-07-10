'use server';

/**
 * @fileOverview Flow to validate extracted transaction details from a slip.
 *
 * - validateExtractedTransactionDetails - Function to validate the extracted details.
 * - ValidateExtractedTransactionDetailsInput - Input type for the function.
 * - ValidateExtractedTransactionDetailsOutput - Output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateExtractedTransactionDetailsInputSchema = z.object({
  account: z.string().describe('The account number.'),
  purpose: z.string().describe('The purpose of the transaction.'),
  amount: z.string().describe('Transaction amount.'),
});

export type ValidateExtractedTransactionDetailsInput = z.infer<typeof ValidateExtractedTransactionDetailsInputSchema>;

const ValidateExtractedTransactionDetailsOutputSchema = z.object({
  validationResult: z.string().describe('A summary of potential errors or inconsistencies found in the extracted data.'),
});

export type ValidateExtractedTransactionDetailsOutput = z.infer<typeof ValidateExtractedTransactionDetailsOutputSchema>;

export async function validateExtractedTransactionDetails(
  input: ValidateExtractedTransactionDetailsInput
): Promise<ValidateExtractedTransactionDetailsOutput> {
  return validateExtractedTransactionDetailsFlow(input);
}

const validateExtractedTransactionDetailsPrompt = ai.definePrompt({
  name: 'validateExtractedTransactionDetailsPrompt',
  input: {
    schema: ValidateExtractedTransactionDetailsInputSchema,
  },
  output: {
    schema: ValidateExtractedTransactionDetailsOutputSchema,
  },
  prompt: `You are an AI assistant that validates extracted transaction details from a slip.
  Your task is to identify potential errors or inconsistencies in the provided data.
  Highlight any discrepancies or missing information that the user should review and correct.

  Account: {{{account}}}
  Purpose: {{{purpose}}}
  Amount: {{{amount}}}

  Provide a concise summary of your findings, focusing on potential issues that require user attention.
  `,
});

const validateExtractedTransactionDetailsFlow = ai.defineFlow(
  {
    name: 'validateExtractedTransactionDetailsFlow',
    inputSchema: ValidateExtractedTransactionDetailsInputSchema,
    outputSchema: ValidateExtractedTransactionDetailsOutputSchema,
  },
  async input => {
    const {output} = await validateExtractedTransactionDetailsPrompt(input);
    return output!;
  }
);
