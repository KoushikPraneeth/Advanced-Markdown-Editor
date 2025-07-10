
export const calculateWordCount = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

export const calculateCharacterCount = (text: string): number => {
  return text.length;
};

export const calculateReadingTime = (text: string): number => {
  const wordsPerMinute = 200; // Average reading speed
  const wordCount = calculateWordCount(text);
  return Math.ceil(wordCount / wordsPerMinute);
};

export const formatReadingTime = (minutes: number): string => {
  if (minutes < 1) return 'less than 1 min read';
  if (minutes === 1) return '1 min read';
  return `${minutes} min read`;
};
