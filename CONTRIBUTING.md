# Contributing to CritiqueQuest

Thank you for considering contributing to CritiqueQuest! Your contributions help make educational technology more accessible and effective for learners worldwide.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contribution Types](#contribution-types)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Educational Focus](#educational-focus)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Community Guidelines](#community-guidelines)

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js 18+** and npm installed
- **Git** for version control
- **TypeScript** familiarity for code contributions
- **React** knowledge for UI contributions
- **Electron** understanding for desktop app features

### Quick Setup

```bash
# Fork the repository on GitHub first, then:
git clone https://github.com/YOUR_USERNAME/critquie-quest.git
cd critquie-quest

# Install dependencies
npm install

# Start development environment
npm run dev

# Open additional terminal for testing
npm run typecheck
npm run lint
```

## Development Setup

### Environment Configuration

1. **AI Provider Setup** (for testing)
   - Set up at least one AI provider (OpenAI, Ollama, etc.)
   - See [AI Setup Documentation](/docs/ai-setup/) for details
   - Create test API keys or local AI installation

2. **Development Tools**
   ```bash
   # Install recommended VS Code extensions
   code --install-extension ms-vscode.vscode-typescript-next
   code --install-extension esbenp.prettier-vscode
   code --install-extension dbaeumer.vscode-eslint
   ```

3. **Project Structure**
   ```
   critquie-quest/
   ├── src/
   │   ├── main/           # Electron main process
   │   ├── renderer/       # React UI
   │   └── shared/         # Shared types and utilities
   ├── docs/              # Documentation site
   ├── tests/             # Test files
   └── scripts/           # Build and development scripts
   ```

## Contribution Types

We welcome various types of contributions:

### 🐛 Bug Reports
- Use the [GitHub Issues](https://github.com/michael-borck/critquie-quest/issues) template
- Include steps to reproduce, expected vs. actual behavior
- Provide system information and CritiqueQuest version
- Include relevant screenshots or error messages

### ✨ Feature Requests
- Describe the educational problem you're solving
- Explain the proposed solution and alternatives considered
- Include mockups or examples if helpful
- Consider the impact on different user types (students, educators, admins)

### 📝 Code Contributions
- Bug fixes and improvements
- New educational features
- Performance optimizations
- AI provider integrations
- Export format additions

### 📖 Documentation
- User guides and tutorials
- Technical documentation
- Example workflows and case studies
- Translation and localization

### 🎨 Design & UX
- Interface improvements
- Accessibility enhancements
- Educational workflow optimizations
- Mobile/responsive design

## Development Workflow

### 1. Issue Discussion
- Check existing issues before creating new ones
- Discuss approach in issue comments before coding
- Tag relevant maintainers for educational feature discussions
- Consider impact on privacy and data handling

### 2. Branch Strategy
```bash
# Create feature branch from main
git checkout -b feature/educational-improvement-name

# Use descriptive branch names:
# feature/practice-mode-enhancements
# fix/case-study-generation-bug
# docs/student-workflow-guide
```

### 3. Development Process
```bash
# Make your changes with frequent commits
git add .
git commit -m "Add practice session analytics feature

- Implement session timing and word count tracking
- Add progress visualization for students
- Include reflection notes capability
- Update related documentation"

# Keep your branch updated
git fetch origin
git rebase origin/main
```

### 4. Pull Request Process
1. **Create Pull Request** with descriptive title and educational context
2. **Fill PR Template** explaining changes and educational impact
3. **Request Review** from relevant maintainers
4. **Address Feedback** promptly and constructively
5. **Update Documentation** if your changes affect user workflows

## Code Standards

### TypeScript Guidelines

**Strict Type Safety**
```typescript
// Good: Explicit types and null checking
interface GenerationInput {
  domain: string;
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  contextSetting: string;
}

function generateCaseStudy(input: GenerationInput): Promise<CaseStudy | null> {
  if (!input.contextSetting.trim()) {
    throw new Error('Context setting is required for case study generation');
  }
  // Implementation...
}

// Avoid: Any types and implicit nulls
function generateCase(input: any): any {
  // Implementation...
}
```

**Educational Domain Modeling**
```typescript
// Good: Clear educational concepts
interface PracticeSession {
  readonly id: number;
  readonly caseStudyId: number;
  readonly startTime: Date;
  endTime?: Date;
  studentNotes: string;
  analyticalFrameworks: string[];
  completionStatus: 'in-progress' | 'completed' | 'abandoned';
}

// Good: Educational validation
function validateCaseStudyContent(content: string): ValidationResult {
  const wordCount = content.split(/\s+/).length;
  const hasLearningObjectives = content.includes('learning objective');
  
  return {
    isValid: wordCount >= 200 && hasLearningObjectives,
    recommendations: generateQualityRecommendations(content)
  };
}
```

### React Component Standards

**Educational Component Design**
```typescript
// Good: Clear educational purpose and accessibility
interface PracticeViewProps {
  caseStudy: CaseStudy;
  onSessionComplete: (session: PracticeSession) => void;
  timerEnabled?: boolean;
  analyticalFrameworks: string[];
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  caseStudy,
  onSessionComplete,
  timerEnabled = false,
  analyticalFrameworks
}) => {
  // Implementation with educational best practices
  return (
    <Box role="main" aria-label="Case Study Practice Session">
      <Typography variant="h4" component="h1">
        {caseStudy.title}
      </Typography>
      {/* Accessible, educational UI */}
    </Box>
  );
};
```

**State Management Best Practices**
```typescript
// Good: Educational state with clear actions
interface EducationalStore {
  // Student progress and learning data
  practiceProgress: PracticeProgress[];
  currentSession: PracticeSession | null;
  
  // Actions with educational context
  startPracticeSession: (caseStudyId: number) => void;
  updateStudentNotes: (notes: string) => void;
  completeAnalysis: (frameworks: string[], insights: string[]) => void;
}
```

### AI Integration Standards

**Educational AI Prompts**
```typescript
// Good: Educational prompt engineering
class EducationalPromptBuilder {
  buildCaseStudyPrompt(input: GenerationInput): string {
    return `
      Create an educational case study for ${input.domain} that:
      
      Educational Objectives:
      - Develops critical thinking skills
      - Applies ${input.frameworks.join(', ')} frameworks
      - Encourages multiple perspective analysis
      - Promotes ethical reasoning
      
      Content Requirements:
      - Realistic, engaging scenario
      - Multiple stakeholder viewpoints
      - Sufficient complexity for ${input.complexity} level
      - Clear decision points requiring analysis
      
      Include guided questions that:
      - Progress from understanding to evaluation
      - Encourage framework application
      - Promote deep analytical thinking
      - Connect to real-world implications
    `;
  }
}
```

## Educational Focus

### Learning-Centered Development

**Always Consider:**
- **Student Experience**: Will this help students learn more effectively?
- **Educator Workflow**: Does this support teaching goals and classroom management?
- **Accessibility**: Can all students use this feature regardless of ability or background?
- **Privacy**: Is student data protected and handled appropriately?

**Educational Best Practices:**
```typescript
// Good: Features that enhance learning
interface LearningAnalytics {
  practiceSessionCount: number;
  averageAnalysisDepth: number;
  frameworkMasteryLevel: Record<string, number>;
  reflectiveInsights: string[];
  progressTrends: ProgressDataPoint[];
}

// Good: Scaffolding and progressive disclosure
interface DifficultyProgression {
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  suggestedNextSteps: string[];
  masteryIndicators: string[];
  supportResources: string[];
}
```

### Content Quality Standards

**Case Study Generation**
- Educational relevance and accuracy
- Appropriate complexity for target audience
- Multiple valid analytical approaches
- Cultural sensitivity and inclusiveness
- Clear learning objectives alignment

**Analysis Questions**
- Progressive difficulty (Bloom's Taxonomy)
- Framework application opportunities
- Critical thinking promotion
- Real-world application connections

## Testing Guidelines

### Test Categories

**Unit Tests** (Individual functions and components)
```typescript
// Good: Educational logic testing
describe('CaseStudyValidator', () => {
  it('should validate minimum educational content standards', () => {
    const caseStudy = {
      content: 'A comprehensive business scenario with stakeholders...',
      questions: 'Analyze using SWOT framework...',
      complexity: 'intermediate'
    };
    
    const result = validateEducationalContent(caseStudy);
    
    expect(result.isValid).toBe(true);
    expect(result.educationalValue).toBeGreaterThan(0.8);
  });
});
```

**Integration Tests** (Feature workflows)
```typescript
// Good: Educational workflow testing
describe('Practice Session Workflow', () => {
  it('should complete full student practice workflow', async () => {
    // Test complete student interaction flow
    const session = await startPracticeSession(testCaseStudy);
    await addStudentNotes(session.id, 'Analysis notes...');
    await applyFramework(session.id, 'SWOT Analysis');
    const completed = await completePracticeSession(session.id);
    
    expect(completed.analyticalQuality).toBeDefined();
    expect(completed.learningOutcomes).toHaveLength(greaterThan(0));
  });
});
```

**Educational Content Tests**
```typescript
// Good: AI-generated content validation
describe('AI Content Quality', () => {
  it('should generate educationally appropriate content', async () => {
    const input = createTestGenerationInput();
    const caseStudy = await generateCaseStudy(input);
    
    expect(caseStudy.content).toContainEducationalElements();
    expect(caseStudy.questions).toPromoteCriticalThinking();
    expect(caseStudy.complexity).toMatchRequestedLevel(input.complexity);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run educational content validation tests
npm run test:educational

# Run AI integration tests (requires API keys)
npm run test:ai
```

## Documentation

### Documentation Standards

**User Documentation**
- Clear, step-by-step instructions
- Screenshots and examples
- Multiple skill levels considered
- Educational context provided

**Technical Documentation**
- Code examples with educational context
- API documentation with use cases
- Architecture decisions explained
- Performance considerations noted

**Educational Documentation**
- Learning objective alignment
- Pedagogical rationale for features
- Best practice recommendations
- Assessment and evaluation guidance

### Documentation Format

```markdown
# Feature Name

## Educational Purpose
Brief description of how this feature supports learning.

## User Types
- **Students**: How students benefit from this feature
- **Educators**: How educators can leverage this feature
- **Administrators**: Administrative considerations

## Step-by-Step Guide
1. Clear, actionable steps
2. Include screenshots where helpful
3. Provide examples and context
4. Note common issues and solutions

## Educational Best Practices
- Recommendations for effective use
- Integration with curriculum
- Assessment considerations

## Technical Details
- Implementation notes for developers
- API usage examples
- Performance considerations
```

## Community Guidelines

### Communication Standards

**Be Educational**
- Focus on learning outcomes and student benefit
- Share pedagogical insights and research
- Respect diverse educational contexts and approaches

**Be Inclusive**
- Welcome contributors from all backgrounds
- Use accessible language and explanations
- Consider global educational perspectives
- Support multiple learning styles and needs

**Be Constructive**
- Provide specific, actionable feedback
- Suggest improvements rather than just identifying problems
- Share knowledge and expertise generously
- Celebrate learning and growth

### Code Review Guidelines

**Educational Focus Review**
- Does this change improve learning outcomes?
- Is the educational purpose clear and well-implemented?
- Are accessibility and inclusion considered?
- Does this align with educational best practices?

**Technical Quality Review**
- Code quality, performance, and maintainability
- Security and privacy considerations
- Cross-platform compatibility
- Documentation completeness

**Review Response**
- Address feedback promptly and professionally
- Ask questions when clarification is needed
- Implement suggested improvements thoughtfully
- Thank reviewers for their time and expertise

## Recognition and Attribution

### Contribution Recognition

Contributors are recognized in:
- **README.md**: Major contributors listed
- **ACKNOWLEDGMENTS.md**: All contributors acknowledged
- **Release Notes**: Feature contributors highlighted
- **Documentation**: Expert reviewers and content creators credited

### Educational Impact

We track and celebrate:
- Features that improve learning outcomes
- Documentation that helps educators
- Bug fixes that enhance student experience
- Community contributions that advance educational technology

---

## Getting Help

### Development Support
- **GitHub Discussions**: General questions and feature discussions
- **GitHub Issues**: Bug reports and specific technical problems
- **Documentation**: Comprehensive guides and references

### Educational Expertise
- **Pedagogical Questions**: Educational best practices and learning theory
- **Assessment Design**: Creating effective evaluation methods
- **Accessibility**: Making features inclusive for all learners

### Technical Assistance
- **Development Setup**: Getting your environment configured
- **AI Integration**: Working with different AI providers
- **Performance**: Optimization and scalability questions

---

**Thank you for contributing to educational technology that makes a difference!** Your efforts help students and educators worldwide engage in more effective, accessible, and meaningful learning experiences.

Every contribution, whether it's code, documentation, or community support, helps advance our mission of transforming education through innovative case study technology. 🎓✨