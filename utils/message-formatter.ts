/**
 * Utility functions for formatting and cleaning chat messages
 */

/**
 * Cleans AI-generated messages by removing technical instructions and formatting artifacts
 * @param content The raw message content from the AI
 * @returns Cleaned message content
 */
export const cleanAIMessage = (content: string): string => {
  if (!content) return '';
  
  // Remove lines starting with "### Instruction:"
  let cleaned = content.replace(/^### Instruction:.*$/gim, '');
  
  // Remove any triple hashtag headers
  cleaned = cleaned.replace(/^###.*$/gim, '');
  
  // Remove system tags
  cleaned = cleaned.replace(/\[SYSTEM\].*?\[\/SYSTEM\]/gis, '');
  
  // Remove any <system> tags
  cleaned = cleaned.replace(/<system>.*?<\/system>/gis, '');
  
  // Remove any other common formatting artifacts
  cleaned = cleaned.replace(/^Instructions:.*$/gim, '');
  cleaned = cleaned.replace(/^System:.*$/gim, '');
  cleaned = cleaned.replace(/^As an AI assistant.*$/gim, '');
  cleaned = cleaned.replace(/^I'll respond as Scarlett.*$/gim, '');
  
  // Trim whitespace and remove extra newlines
  cleaned = cleaned.trim();
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n'); // Replace 3+ newlines with just 2
  
  return cleaned;
};