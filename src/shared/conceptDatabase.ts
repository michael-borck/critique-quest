/**
 * Two-level knowledge framework with categories and disciplines
 * Used for generating hierarchical dropdowns in case study generation
 */

export interface DisciplineConcepts {
  [discipline: string]: string[];
}

export interface CategoryStructure {
  [category: string]: {
    disciplines: string[];
    concepts: DisciplineConcepts;
  };
}

export interface ConceptCategory {
  name: string;
  concepts: string[];
}

// Two-level framework structure
export const frameworkStructure: CategoryStructure = {
  'Business & Management': {
    disciplines: [
      'Entrepreneurship',
      'Human Resources', 
      'Marketing',
      'Finance',
      'Operations Management',
      'Strategy & Leadership',
      'Project Management'
    ],
    concepts: {
      'Entrepreneurship': [
        'Lean Startup Methodology',
        'Business Model Canvas',
        'Effectuation Theory',
        'Opportunity Recognition Theory',
        'Resource-Based Theory of Entrepreneurship',
        'Entrepreneurial Orientation',
        'Innovation Diffusion Theory',
        'Venture Capital Decision Models',
        'Social Entrepreneurship Theory',
        'Bootstrapping Strategies'
      ],
      'Human Resources': [
        'Talent Management Framework',
        'Performance Management Systems',
        'Employee Engagement Models (Kahn, Gallup)',
        'Competency-Based Management',
        'Diversity, Equity & Inclusion Frameworks',
        'Compensation Theory',
        'Training & Development Models (70-20-10)',
        'Change Management (Kotter\'s 8-Step)',
        'Employment Relations Theory',
        'HR Analytics Models'
      ],
      'Marketing': [
        '4Ps/7Ps Marketing Mix',
        'Customer Lifetime Value (CLV)',
        'Brand Equity Theory (Keller, Aaker)',
        'Consumer Behavior Models',
        'Digital Marketing Funnel (AIDA, RACE)',
        'Relationship Marketing Theory',
        'Social Media Marketing Frameworks',
        'Content Marketing Strategy',
        'Market Segmentation Theory',
        'Pricing Strategies',
        'Customer Journey Mapping',
        'Diffusion of Innovation',
        'Consumer Decision Process',
        'Segmentation, Targeting, Positioning (STP)'
      ],
      'Finance': [
        'Modern Portfolio Theory',
        'Efficient Market Hypothesis',
        'Capital Asset Pricing Model (CAPM)',
        'Behavioral Finance Theory',
        'Risk Management Frameworks',
        'Financial Planning Models'
      ],
      'Operations Management': [
        'Supply Chain Management Theory',
        'Just-in-Time (JIT)',
        'Total Quality Management (TQM)',
        'Theory of Constraints',
        'Inventory Management Models'
      ],
      'Strategy & Leadership': [
        'Porter\'s Five Forces',
        'SWOT Analysis',
        'Blue Ocean Strategy',
        'Lean Six Sigma',
        'Balanced Scorecard',
        'Resource-Based View (RBV)',
        'Disruptive Innovation Theory',
        'Maslow\'s Hierarchy of Needs',
        'Herzberg\'s Two-Factor Theory',
        'Tuckman\'s Stages of Group Development',
        'Theory X and Theory Y',
        'Transformational vs Transactional Leadership',
        'Servant Leadership',
        'Situational Leadership',
        'Emotional Intelligence (Goleman)',
        'Growth vs Fixed Mindset'
      ],
      'Project Management': [
        'PMBOK Framework',
        'Agile/Scrum Methodology',
        'Critical Path Method',
        'Risk Management Frameworks',
        'Stakeholder Theory'
      ]
    }
  },

  'Technology & Engineering': {
    disciplines: [
      'Software Development',
      'Technology Management',
      'Engineering Management',
      'Data Science & Analytics'
    ],
    concepts: {
      'Software Development': [
        'Systems Development Life Cycle (SDLC)',
        'DevOps Principles',
        'User-Centered Design',
        'Design Thinking',
        'Cybersecurity Frameworks (NIST)',
        'Data Governance Models',
        'AI Ethics Frameworks'
      ],
      'Technology Management': [
        'Technology Adoption Lifecycle',
        'Digital Transformation Models',
        'Innovation Management',
        'IT Service Management (ITIL)',
        'Systems Theory',
        'Technology Acceptance Model'
      ],
      'Engineering Management': [
        'Systems Engineering',
        'Design Thinking Process',
        'Failure Mode Analysis (FMEA)',
        'Quality Control Models',
        'Product Development Lifecycle',
        'Technology Readiness Levels',
        'Innovation Management',
        'Engineering Economics',
        'Project Risk Assessment'
      ],
      'Data Science & Analytics': [
        'Statistical Hypothesis Testing',
        'Machine Learning Algorithms',
        'Predictive Modeling',
        'A/B Testing Framework',
        'Data Mining Techniques',
        'Business Intelligence Models',
        'Statistical Process Control',
        'Regression Analysis',
        'Classification Models',
        'Time Series Analysis'
      ]
    }
  },

  'Health & Life Sciences': {
    disciplines: [
      'Healthcare Management',
      'Clinical Frameworks',
      'Public Health',
      'Pharmaceutical & Biotech Business'
    ],
    concepts: {
      'Healthcare Management': [
        'Triple Aim Framework',
        'Lean Healthcare',
        'Healthcare Quality Models (Donabedian)',
        'Patient-Centered Care',
        'Interprofessional Collaboration Models'
      ],
      'Clinical Frameworks': [
        'Evidence-Based Practice',
        'Clinical Decision-Making Models',
        'Patient Safety Frameworks (Swiss Cheese Model)',
        'Quality Improvement (PDSA Cycles)',
        'Chronic Care Model',
        'Health Belief Model',
        'Social Determinants of Health'
      ],
      'Public Health': [
        'Epidemiological Models',
        'Health Promotion Theory',
        'Social Determinants Framework',
        'Community Health Assessment',
        'Health Policy Analysis',
        'Disease Prevention Models'
      ],
      'Pharmaceutical & Biotech Business': [
        'Drug Development Pipeline',
        'Regulatory Approval Process (FDA)',
        'Clinical Trial Design',
        'Intellectual Property in Life Sciences',
        'Biotech Commercialization',
        'Pharmacoeconomics'
      ]
    }
  },

  'Education & Social Sciences': {
    disciplines: [
      'Learning Theories',
      'Educational Management',
      'Psychology',
      'Sociology'
    ],
    concepts: {
      'Learning Theories': [
        'Bloom\'s Taxonomy',
        'Constructivism',
        'Social Constructivism',
        'Multiple Intelligence Theory',
        'Adult Learning Theory (Andragogy)',
        'Experiential Learning (Kolb)',
        'Universal Design for Learning (UDL)'
      ],
      'Educational Management': [
        'Instructional Design Models (ADDIE)',
        'Kirkpatrick\'s Evaluation Model',
        'Differentiated Instruction',
        'Assessment for Learning',
        'Curriculum Development Theory'
      ],
      'Psychology': [
        'Cognitive Behavioral Theory',
        'Social Learning Theory',
        'Attachment Theory',
        'Social Identity Theory',
        'Attribution Theory',
        'Stereotype Threat',
        'Motivation Theories',
        'Personality Theories'
      ],
      'Sociology': [
        'Social Capital Theory',
        'Network Theory',
        'Institutional Theory',
        'Social Exchange Theory',
        'Conflict Theory',
        'Symbolic Interactionism'
      ]
    }
  },

  'Applied Sciences': {
    disciplines: [
      'Environmental Science',
      'Environmental Business',
      'Food Science & Business'
    ],
    concepts: {
      'Environmental Science': [
        'Ecosystem Services Framework',
        'Life Cycle Assessment (LCA)',
        'Carbon Footprint Analysis',
        'Sustainability Science Models',
        'Climate Change Adaptation Theory',
        'Environmental Impact Assessment',
        'Circular Economy Principles',
        'Biodiversity Conservation Models',
        'Pollution Control Theory',
        'Environmental Justice Framework'
      ],
      'Environmental Business': [
        'Environmental Management Systems (ISO 14001)',
        'Green Supply Chain Management',
        'Carbon Trading Markets',
        'Renewable Energy Business Models',
        'Corporate Sustainability Reporting'
      ],
      'Food Science & Business': [
        'Food Safety Management Systems (HACCP)',
        'Supply Chain Traceability',
        'Product Development Process',
        'Nutritional Labeling Compliance',
        'Sustainable Food Systems'
      ]
    }
  },

  'Specialized Areas': {
    disciplines: [
      'Tourism & Hospitality',
      'Technology Transfer'
    ],
    concepts: {
      'Tourism & Hospitality': [
        'Tourism Area Life Cycle (Butler)',
        'Service Quality Models (SERVQUAL)',
        'Tourist Motivation Theory (Push-Pull)',
        'Destination Image Theory',
        'Sustainable Tourism Models',
        'Experience Economy Theory',
        'Tourist Behavior Models',
        'Crisis Management in Tourism',
        'Cultural Tourism Framework',
        'Ecotourism Principles'
      ],
      'Technology Transfer': [
        'Innovation Commercialization',
        'Research & Development Management',
        'Patent Strategy',
        'University-Industry Partnerships',
        'Startup Incubation Models'
      ]
    }
  }
};

// Cross-domain personal and interpersonal skills
export const personalSkillsConcepts: ConceptCategory[] = [
  {
    name: 'Communication & Interpersonal',
    concepts: [
      'Active Listening',
      'Nonverbal Communication',
      'Communication Styles',
      'Cross-Cultural Communication',
      'Presentation Skills',
      'Written Communication'
    ]
  },
  {
    name: 'Conflict & Negotiation',
    concepts: [
      'Conflict Resolution Styles (Thomas-Kilmann)',
      'Negotiation Styles',
      'Mediation Techniques',
      'Win-Win Negotiation',
      'Difficult Conversations'
    ]
  },
  {
    name: 'Decision Making & Problem Solving',
    concepts: [
      'Critical Thinking',
      'Decision-Making Models',
      'Problem-Solving Frameworks',
      'Systems Thinking',
      'Creative Problem Solving'
    ]
  },
  {
    name: 'Personal Development',
    concepts: [
      'Cultural Intelligence (CQ)',
      'Personality Types (Big Five, DISC)',
      'Core Values Frameworks',
      'Self-Awareness',
      'Stress Management',
      'Time Management'
    ]
  }
];

// Helper functions for the new structure
export const getCategories = (): string[] => {
  return Object.keys(frameworkStructure);
};

export const getDisciplinesForCategory = (category: string): string[] => {
  return frameworkStructure[category]?.disciplines || [];
};

export const getConceptsForDiscipline = (category: string, discipline: string): string[] => {
  return frameworkStructure[category]?.concepts[discipline] || [];
};

export const getAllConceptsForCategory = (category: string): string[] => {
  const categoryData = frameworkStructure[category];
  if (!categoryData) return [];
  
  return categoryData.disciplines.flatMap(discipline => 
    categoryData.concepts[discipline] || []
  );
};

// Legacy compatibility functions (for existing components)
export const domainConcepts: Record<string, ConceptCategory[]> = {
  'Business & Management': [{ name: 'All Concepts', concepts: getAllConceptsForCategory('Business & Management') }],
  'Technology & Engineering': [{ name: 'All Concepts', concepts: getAllConceptsForCategory('Technology & Engineering') }],
  'Health & Life Sciences': [{ name: 'All Concepts', concepts: getAllConceptsForCategory('Health & Life Sciences') }],
  'Education & Social Sciences': [{ name: 'All Concepts', concepts: getAllConceptsForCategory('Education & Social Sciences') }],
  'Applied Sciences': [{ name: 'All Concepts', concepts: getAllConceptsForCategory('Applied Sciences') }],
  'Specialized Areas': [{ name: 'All Concepts', concepts: getAllConceptsForCategory('Specialized Areas') }]
};

export const getConceptsForDomain = (domain: string): ConceptCategory[] => {
  return domainConcepts[domain] || [];
};

export const getAllConceptsForDomain = (domain: string): string[] => {
  const categories = getConceptsForDomain(domain);
  return categories.flatMap(category => category.concepts);
};

// Helper function to get random concepts for "I'm Feeling Lucky"
export const getRandomConcepts = (domain: string, count: number = 2): string[] => {
  const allConcepts = getAllConceptsForDomain(domain);
  const shuffled = allConcepts.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper function to get random concepts from a specific discipline
export const getRandomConceptsFromDiscipline = (category: string, discipline: string, count: number = 2): string[] => {
  const concepts = getConceptsForDiscipline(category, discipline);
  const shuffled = concepts.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper function to get random personal skills
export const getRandomPersonalSkills = (count: number = 1): string[] => {
  const allPersonalSkills = personalSkillsConcepts.flatMap(category => category.concepts);
  const shuffled = allPersonalSkills.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};