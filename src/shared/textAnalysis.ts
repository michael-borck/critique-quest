/**
 * Text analysis utilities for practice session evaluation
 * Provides local analysis without requiring AI
 */

export interface TextMetrics {
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  averageWordsPerSentence: number;
  averageSentencesPerParagraph: number;
  readabilityScore: number;
  complexityLevel: 'Simple' | 'Moderate' | 'Complex' | 'Very Complex';
}

export interface AnswerAnalysis {
  questionIndex: number;
  questionText: string;
  answer: string;
  metrics: TextMetrics;
  completeness: 'Empty' | 'Minimal' | 'Adequate' | 'Comprehensive';
  estimatedReadingTime: number; // in seconds
}

export interface PracticeAnalysis {
  totalAnswers: number;
  answeredQuestions: number;
  completionRate: number; // percentage
  totalWordCount: number;
  averageWordsPerAnswer: number;
  totalTimeSpent: number; // in seconds
  averageTimePerAnswer: number; // in seconds
  overallReadabilityScore: number;
  overallComplexityLevel: string;
  answerAnalyses: AnswerAnalysis[];
  summary: {
    strengths: string[];
    suggestions: string[];
  };
}

/**
 * Calculate Flesch-Kincaid readability score
 */
export function calculateReadabilityScore(text: string): number {
  if (!text.trim()) return 0;
  
  const sentences = countSentences(text);
  const words = countWords(text);
  const syllables = countSyllables(text);
  
  if (sentences === 0 || words === 0) return 0;
  
  // Flesch-Kincaid Grade Level formula
  const score = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
  return Math.max(0, Math.round(score * 10) / 10);
}

/**
 * Get complexity level based on readability score
 */
export function getComplexityLevel(score: number): 'Simple' | 'Moderate' | 'Complex' | 'Very Complex' {
  if (score <= 6) return 'Simple';
  if (score <= 9) return 'Moderate';
  if (score <= 13) return 'Complex';
  return 'Very Complex';
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Count sentences in text
 */
export function countSentences(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  return Math.max(1, sentences.length);
}

/**
 * Count paragraphs in text
 */
export function countParagraphs(text: string): number {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  return Math.max(1, paragraphs.length);
}

/**
 * Estimate syllable count (rough approximation)
 */
export function countSyllables(text: string): number {
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  let syllableCount = 0;
  
  for (const word of words) {
    // Simple syllable counting heuristic
    let syllables = word.replace(/[^aeiou]/g, '').length;
    if (word.endsWith('e')) syllables--;
    if (word.includes('le') && word.length > 2) syllables++;
    syllableCount += Math.max(1, syllables);
  }
  
  return syllableCount;
}

/**
 * Analyze a single answer
 */
export function analyzeAnswer(questionText: string, answer: string, questionIndex: number): AnswerAnalysis {
  const wordCount = countWords(answer);
  const sentenceCount = countSentences(answer);
  const paragraphCount = countParagraphs(answer);
  const readabilityScore = calculateReadabilityScore(answer);
  
  const metrics: TextMetrics = {
    wordCount,
    sentenceCount,
    paragraphCount,
    averageWordsPerSentence: sentenceCount > 0 ? Math.round((wordCount / sentenceCount) * 10) / 10 : 0,
    averageSentencesPerParagraph: paragraphCount > 0 ? Math.round((sentenceCount / paragraphCount) * 10) / 10 : 0,
    readabilityScore,
    complexityLevel: getComplexityLevel(readabilityScore)
  };
  
  // Determine completeness based on word count and content
  let completeness: 'Empty' | 'Minimal' | 'Adequate' | 'Comprehensive';
  if (wordCount === 0) {
    completeness = 'Empty';
  } else if (wordCount < 25) {
    completeness = 'Minimal';
  } else if (wordCount < 100) {
    completeness = 'Adequate';
  } else {
    completeness = 'Comprehensive';
  }
  
  // Estimate reading time (average reading speed: 200 words per minute)
  const estimatedReadingTime = Math.ceil((wordCount / 200) * 60);
  
  return {
    questionIndex,
    questionText,
    answer,
    metrics,
    completeness,
    estimatedReadingTime
  };
}

/**
 * Generate local suggestions based on analysis
 */
export function generateLocalSuggestions(analysis: PracticeAnalysis): { strengths: string[]; suggestions: string[] } {
  const strengths: string[] = [];
  const suggestions: string[] = [];
  
  // Analyze completion rate
  if (analysis.completionRate === 100) {
    strengths.push("Completed all questions thoroughly");
  } else if (analysis.completionRate >= 80) {
    strengths.push("Answered most questions");
    suggestions.push("Consider addressing any remaining unanswered questions");
  } else {
    suggestions.push("Try to answer all questions for better learning outcomes");
  }
  
  // Analyze word count
  if (analysis.averageWordsPerAnswer >= 75) {
    strengths.push("Provided detailed responses");
  } else if (analysis.averageWordsPerAnswer >= 40) {
    strengths.push("Gave adequate detail in responses");
  } else {
    suggestions.push("Consider expanding your answers with more detail and examples");
  }
  
  // Analyze complexity
  if (analysis.overallComplexityLevel === 'Complex' || analysis.overallComplexityLevel === 'Very Complex') {
    strengths.push("Used sophisticated language and concepts");
  } else if (analysis.overallComplexityLevel === 'Simple') {
    suggestions.push("Consider using more advanced vocabulary and complex sentence structures");
  }
  
  // Analyze time spent
  if (analysis.averageTimePerAnswer >= 300) { // 5+ minutes per answer
    strengths.push("Took time to think through responses carefully");
  } else if (analysis.averageTimePerAnswer < 120) { // less than 2 minutes
    suggestions.push("Consider spending more time analyzing each question");
  }
  
  // Analyze sentence structure
  const avgWordsPerSentence = analysis.answerAnalyses.reduce((sum, a) => 
    sum + a.metrics.averageWordsPerSentence, 0) / analysis.answerAnalyses.length;
  
  if (avgWordsPerSentence >= 15) {
    strengths.push("Used well-developed sentence structures");
  } else if (avgWordsPerSentence < 10) {
    suggestions.push("Try varying sentence length and structure for better flow");
  }
  
  return { strengths, suggestions };
}

/**
 * Analyze a complete practice session
 */
export function analyzePracticeSession(
  questions: string[],
  answers: string[],
  timeSpent: number
): PracticeAnalysis {
  const answerAnalyses: AnswerAnalysis[] = questions.map((question, index) => 
    analyzeAnswer(question, answers[index] || '', index)
  );
  
  const answeredQuestions = answerAnalyses.filter(a => a.answer.trim().length > 0).length;
  const totalWordCount = answerAnalyses.reduce((sum, a) => sum + a.metrics.wordCount, 0);
  const averageWordsPerAnswer = answeredQuestions > 0 ? Math.round(totalWordCount / answeredQuestions) : 0;
  const averageTimePerAnswer = answeredQuestions > 0 ? Math.round(timeSpent / answeredQuestions) : 0;
  
  // Calculate overall readability
  const totalWords = answerAnalyses.reduce((sum, a) => sum + a.metrics.wordCount, 0);
  const weightedReadabilitySum = answerAnalyses.reduce((sum, a) => 
    sum + (a.metrics.readabilityScore * a.metrics.wordCount), 0);
  const overallReadabilityScore = totalWords > 0 ? 
    Math.round((weightedReadabilitySum / totalWords) * 10) / 10 : 0;
  
  const analysis: PracticeAnalysis = {
    totalAnswers: questions.length,
    answeredQuestions,
    completionRate: Math.round((answeredQuestions / questions.length) * 100),
    totalWordCount,
    averageWordsPerAnswer,
    totalTimeSpent: timeSpent,
    averageTimePerAnswer,
    overallReadabilityScore,
    overallComplexityLevel: getComplexityLevel(overallReadabilityScore),
    answerAnalyses,
    summary: { strengths: [], suggestions: [] }
  };
  
  analysis.summary = generateLocalSuggestions(analysis);
  
  return analysis;
}

/**
 * Format time in a human-readable way
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
}

/**
 * Get a color for readability score visualization
 */
export function getReadabilityColor(score: number): string {
  if (score <= 6) return '#4CAF50'; // Green - Simple
  if (score <= 9) return '#FF9800'; // Orange - Moderate  
  if (score <= 13) return '#F44336'; // Red - Complex
  return '#9C27B0'; // Purple - Very Complex
}

/**
 * Get a color for completeness visualization
 */
export function getCompletenessColor(completeness: string): string {
  switch (completeness) {
    case 'Empty': return '#F44336'; // Red
    case 'Minimal': return '#FF9800'; // Orange
    case 'Adequate': return '#2196F3'; // Blue
    case 'Comprehensive': return '#4CAF50'; // Green
    default: return '#9E9E9E'; // Gray
  }
}