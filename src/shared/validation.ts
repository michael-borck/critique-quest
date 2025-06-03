import type { CaseStudy, GenerationInput } from './types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score?: number;
}

export class QualityValidator {
  
  validateGenerationInput(input: GenerationInput): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!input.context_setting?.trim()) {
      errors.push('Context setting is required');
    }

    // Length validation
    if (input.context_setting && input.context_setting.length < 10) {
      warnings.push('Context setting is very short - consider adding more detail');
    }

    if (input.custom_prompt && input.custom_prompt.length > 1000) {
      warnings.push('Custom prompt is very long - this may affect generation quality');
    }

    // Content elements validation
    const hasAnyElement = Object.values(input.include_elements).some(Boolean);
    if (!hasAnyElement) {
      warnings.push('No content elements selected - case study may lack structure');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  validateCaseStudy(caseStudy: CaseStudy): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Title validation
    if (!caseStudy.title?.trim()) {
      errors.push('Case study must have a title');
      score -= 20;
    } else if (caseStudy.title.length < 5) {
      warnings.push('Title is very short');
      score -= 5;
    } else if (caseStudy.title.length > 100) {
      warnings.push('Title is unusually long');
      score -= 5;
    }

    // Content validation
    if (!caseStudy.content?.trim()) {
      errors.push('Case study must have content');
      score -= 30;
    } else {
      const contentValidation = this.validateContent(caseStudy.content);
      score -= contentValidation.penalties;
      warnings.push(...contentValidation.warnings);
    }

    // Questions validation
    if (!caseStudy.questions?.trim()) {
      warnings.push('No analysis questions provided');
      score -= 10;
    } else {
      const questionValidation = this.validateQuestions(caseStudy.questions);
      warnings.push(...questionValidation.warnings);
      score -= questionValidation.penalties;
    }

    // Word count validation
    const targetWordCount = this.getTargetWordCount(caseStudy.complexity);
    if (caseStudy.word_count < targetWordCount.min) {
      warnings.push(`Content is shorter than recommended for ${caseStudy.complexity} level (${caseStudy.word_count}/${targetWordCount.min} words)`);
      score -= 10;
    } else if (caseStudy.word_count > targetWordCount.max) {
      warnings.push(`Content is longer than recommended for ${caseStudy.complexity} level (${caseStudy.word_count}/${targetWordCount.max} words)`);
      score -= 5;
    }

    // Readability check
    const readabilityScore = this.calculateReadabilityScore(caseStudy.content);
    const readabilityValidation = this.validateReadability(readabilityScore, caseStudy.complexity);
    warnings.push(...readabilityValidation.warnings);
    score -= readabilityValidation.penalties;

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, score)
    };
  }

  private validateContent(content: string): { warnings: string[]; penalties: number } {
    const warnings: string[] = [];
    let penalties = 0;

    // Check for very short paragraphs
    const paragraphs = content.split('\n\n');
    const shortParagraphs = paragraphs.filter(p => p.trim().length < 50);
    if (shortParagraphs.length > paragraphs.length / 2) {
      warnings.push('Many paragraphs are very short - consider expanding ideas');
      penalties += 5;
    }

    // Check for repetitive language
    const sentences = content.split(/[.!?]+/);
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    const wordFreq = new Map<string, number>();
    
    words.forEach(word => {
      if (word.length > 3) { // Only check meaningful words
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      }
    });

    const repetitiveWords = Array.from(wordFreq.entries())
      .filter(([word, count]) => count > Math.max(3, words.length / 100))
      .map(([word]) => word);

    if (repetitiveWords.length > 0) {
      warnings.push('Some words appear frequently - consider using synonyms for variety');
      penalties += 3;
    }

    // Check for adequate detail
    if (sentences.length < 5) {
      warnings.push('Content seems too brief - consider adding more detail');
      penalties += 10;
    }

    return { warnings, penalties };
  }

  private validateQuestions(questions: string): { warnings: string[]; penalties: number } {
    const warnings: string[] = [];
    let penalties = 0;

    const questionList = questions.split(/\n|\?/).filter(q => q.trim().length > 0);
    
    if (questionList.length < 2) {
      warnings.push('Consider adding more analysis questions for better learning outcomes');
      penalties += 5;
    }

    if (questionList.length > 8) {
      warnings.push('Many questions provided - ensure they focus on key concepts');
      penalties += 2;
    }

    // Check for question quality indicators
    const hasOpenEnded = questionList.some(q => 
      /\b(how|why|what.*think|analyze|evaluate|compare|discuss)\b/i.test(q)
    );
    
    if (!hasOpenEnded) {
      warnings.push('Consider adding open-ended questions to promote critical thinking');
      penalties += 5;
    }

    return { warnings, penalties };
  }

  private getTargetWordCount(complexity: string): { min: number; max: number } {
    switch (complexity) {
      case 'Beginner':
        return { min: 300, max: 800 };
      case 'Intermediate':
        return { min: 500, max: 1200 };
      case 'Advanced':
        return { min: 800, max: 2000 };
      default:
        return { min: 500, max: 1200 };
    }
  }

  private calculateReadabilityScore(content: string): number {
    // Simplified Flesch Reading Ease calculation
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.match(/\b\w+\b/g) || [];
    const syllables = words.reduce((total, word) => total + this.countSyllables(word), 0);

    if (sentences.length === 0 || words.length === 0) return 0;

    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    return 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  }

  private countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    const vowels = word.match(/[aeiouy]+/g);
    let syllableCount = vowels ? vowels.length : 1;
    
    // Adjust for silent e
    if (word.endsWith('e')) syllableCount--;
    
    // Ensure at least one syllable
    return Math.max(1, syllableCount);
  }

  private validateReadability(score: number, complexity: string): { warnings: string[]; penalties: number } {
    const warnings: string[] = [];
    let penalties = 0;

    const targets = {
      'Beginner': { min: 60, max: 90 }, // Easy to read
      'Intermediate': { min: 50, max: 70 }, // Moderate difficulty
      'Advanced': { min: 30, max: 60 } // More challenging
    };

    const target = targets[complexity as keyof typeof targets] || targets.Intermediate;

    if (score < target.min) {
      warnings.push(`Content may be too complex for ${complexity} level readers`);
      penalties += 5;
    } else if (score > target.max) {
      warnings.push(`Content may be too simple for ${complexity} level readers`);
      penalties += 3;
    }

    return { warnings, penalties };
  }

  // Content appropriateness check
  validateContentAppropriateness(content: string): ValidationResult {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Basic content filtering
    const inappropriatePatterns = [
      /\b(explicit|inappropriate|offensive)\b/i,
      // Add more patterns as needed
    ];

    for (const pattern of inappropriatePatterns) {
      if (pattern.test(content)) {
        warnings.push('Content may contain inappropriate material - please review');
        break;
      }
    }

    // Check for educational value indicators
    const educationalIndicators = [
      /\b(analyze|evaluate|consider|examine|discuss|compare|contrast)\b/i,
      /\b(learning|education|skill|knowledge|understanding)\b/i
    ];

    const hasEducationalValue = educationalIndicators.some(pattern => pattern.test(content));
    if (!hasEducationalValue) {
      warnings.push('Consider adding more educational context or learning objectives');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Generate improvement suggestions
  generateImprovementSuggestions(caseStudy: CaseStudy): string[] {
    const suggestions: string[] = [];
    const validation = this.validateCaseStudy(caseStudy);

    if (validation.score && validation.score < 70) {
      suggestions.push('Consider regenerating sections that need improvement');
    }

    if (caseStudy.word_count < 400) {
      suggestions.push('Add more background context and supporting details');
    }

    if (!caseStudy.questions.includes('Why') && !caseStudy.questions.includes('How')) {
      suggestions.push('Include more open-ended questions starting with "Why" or "How"');
    }

    if (caseStudy.tags.length < 3) {
      suggestions.push('Add more relevant tags for better organization');
    }

    if (!caseStudy.answers) {
      suggestions.push('Consider generating model answers for educational reference');
    }

    return suggestions;
  }
}