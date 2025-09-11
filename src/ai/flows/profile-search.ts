'use server';

/**
 * @fileOverview Flow to validate an Instagram profile name.
 *
 * - validateProfileName - A function that validates an Instagram profile name.
 * - ValidateProfileNameInput - The input type for the validateProfileName function.
 * - ValidateProfileNameOutput - The return type for the validateProfileName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateProfileNameInputSchema = z.object({
  username: z
    .string()
    .describe('The Instagram username to validate.'),
});
export type ValidateProfileNameInput = z.infer<typeof ValidateProfileNameInputSchema>;

const ValidateProfileNameOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the Instagram profile name is valid or not.'),
  profilePictureUrl: z.string().optional().describe('The URL of the profile picture, if the profile is valid.'),
});
export type ValidateProfileNameOutput = z.infer<typeof ValidateProfileNameOutputSchema>;

export async function validateProfileName(input: ValidateProfileNameInput): Promise<ValidateProfileNameOutput> {
  return validateProfileNameFlow(input);
}

const getInstagramProfile = ai.defineTool({
  name: 'getInstagramProfile',
  description: 'Check if an Instagram profile exists and retrieve its profile picture URL.',
  inputSchema: z.object({
    username: z.string().describe('The Instagram username to check.'),
  }),
  outputSchema: z.object({
    isValid: z.boolean().describe('Whether the Instagram profile exists.'),
    profilePictureUrl: z.string().optional().describe('The URL of the profile picture, if available.'),
  }),
},
async (input) => {
  // In a real application, this would call the Instagram API.
  // Due to the lack of a real API, this is a stub implementation.
  const username = input.username;
  if (username === 'exists') {
    return {
      isValid: true,
      profilePictureUrl: 'https://example.com/profile.jpg',
    };
  } else if (username === 'error') {
    throw new Error('Failed to retrieve Instagram profile.');
  } else {
    return {
      isValid: false,
    };
  }
}
);

const validateProfileNamePrompt = ai.definePrompt({
  name: 'validateProfileNamePrompt',
  tools: [getInstagramProfile],
  input: {schema: ValidateProfileNameInputSchema},
  output: {schema: ValidateProfileNameOutputSchema},
  prompt: `Use the getInstagramProfile tool to check if the Instagram profile {{username}} is valid.
  Return the isValid boolean and profilePictureUrl if the profile exists.`,
});

const validateProfileNameFlow = ai.defineFlow(
  {
    name: 'validateProfileNameFlow',
    inputSchema: ValidateProfileNameInputSchema,
    outputSchema: ValidateProfileNameOutputSchema,
  },
  async input => {
    const {output} = await validateProfileNamePrompt(input);
    return output!;
  }
);
