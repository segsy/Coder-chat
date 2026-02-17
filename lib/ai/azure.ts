import { AzureKeyCredential, OpenAIClient } from '@azure/openai';

const endpoint = process.env.AZURE_OPENAI_ENDPOINT || '';
const apiKey = process.env.AZURE_OPENAI_API_KEY || '';

export const azureClient = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));
export const DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';
