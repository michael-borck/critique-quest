// Knowledge concepts organized by domain and category
export interface ConceptCategory {
  name: string;
  concepts: string[];
}

export interface DomainConcepts {
  [domain: string]: ConceptCategory[];
}

export const domainConcepts: DomainConcepts = {
  'Business': [
    {
      name: 'Organizational Behavior & Leadership',
      concepts: [
        "Maslow's Hierarchy of Needs",
        "Herzberg's Two-Factor Theory",
        "Tuckman's Stages of Group Development",
        "Theory X and Theory Y",
        "Transformational vs Transactional Leadership",
        "Servant Leadership",
        "Situational Leadership",
        "Emotional Intelligence (Goleman)",
        "Growth vs Fixed Mindset"
      ]
    },
    {
      name: 'Strategy & Operations',
      concepts: [
        "Porter's Five Forces",
        "SWOT Analysis",
        "Blue Ocean Strategy",
        "Lean Six Sigma",
        "Agile Methodology",
        "Balanced Scorecard",
        "Resource-Based View (RBV)",
        "Disruptive Innovation Theory"
      ]
    },
    {
      name: 'Marketing & Consumer Behavior',
      concepts: [
        "4Ps/7Ps Marketing Mix",
        "Customer Journey Mapping",
        "Diffusion of Innovation",
        "Brand Equity Theory",
        "Consumer Decision Process",
        "Segmentation, Targeting, Positioning (STP)"
      ]
    }
  ],
  'Healthcare': [
    {
      name: 'Clinical Frameworks',
      concepts: [
        "Evidence-Based Practice",
        "Clinical Decision-Making Models",
        "Patient Safety Frameworks (Swiss Cheese Model)",
        "Quality Improvement (PDSA Cycles)",
        "Chronic Care Model",
        "Health Belief Model",
        "Social Determinants of Health"
      ]
    },
    {
      name: 'Healthcare Management',
      concepts: [
        "Triple Aim Framework",
        "Lean Healthcare",
        "Healthcare Quality Models (Donabedian)",
        "Patient-Centered Care",
        "Interprofessional Collaboration Models"
      ]
    }
  ],
  'Technology': [
    {
      name: 'Software Development',
      concepts: [
        "Systems Development Life Cycle (SDLC)",
        "DevOps Principles",
        "User-Centered Design",
        "Design Thinking",
        "Cybersecurity Frameworks (NIST)",
        "Data Governance Models",
        "AI Ethics Frameworks"
      ]
    },
    {
      name: 'Technology Management',
      concepts: [
        "Technology Adoption Lifecycle",
        "Digital Transformation Models",
        "Innovation Management",
        "IT Service Management (ITIL)"
      ]
    }
  ],
  'Social Sciences': [
    {
      name: 'Psychology',
      concepts: [
        "Cognitive Behavioral Theory",
        "Social Learning Theory",
        "Attachment Theory",
        "Social Identity Theory",
        "Attribution Theory",
        "Stereotype Threat"
      ]
    },
    {
      name: 'Sociology',
      concepts: [
        "Social Capital Theory",
        "Network Theory",
        "Institutional Theory",
        "Social Exchange Theory",
        "Conflict Theory",
        "Symbolic Interactionism"
      ]
    }
  ],
  'Education': [
    {
      name: 'Learning Theories',
      concepts: [
        "Bloom's Taxonomy",
        "Constructivism",
        "Social Constructivism",
        "Multiple Intelligence Theory",
        "Adult Learning Theory (Andragogy)",
        "Experiential Learning (Kolb)",
        "Universal Design for Learning (UDL)"
      ]
    },
    {
      name: 'Educational Management',
      concepts: [
        "Instructional Design Models (ADDIE)",
        "Kirkpatrick's Evaluation Model",
        "Differentiated Instruction",
        "Assessment for Learning"
      ]
    }
  ],
  'Science': [
    {
      name: 'Research Methodology',
      concepts: [
        "Scientific Method",
        "Experimental Design",
        "Hypothesis Testing",
        "Peer Review Process",
        "Reproducibility Crisis",
        "Statistical Significance",
        "Correlation vs Causation"
      ]
    },
    {
      name: 'Ethics & Philosophy of Science',
      concepts: [
        "Research Ethics",
        "Informed Consent",
        "Publication Ethics",
        "Scientific Integrity",
        "Falsifiability (Popper)",
        "Paradigm Shifts (Kuhn)"
      ]
    }
  ]
};

// Cross-domain personal and interpersonal skills
export const personalSkillsConcepts: ConceptCategory[] = [
  {
    name: 'Communication & Interpersonal',
    concepts: [
      "Active Listening",
      "Nonverbal Communication",
      "Communication Styles",
      "Cross-Cultural Communication",
      "Presentation Skills",
      "Written Communication"
    ]
  },
  {
    name: 'Conflict & Negotiation',
    concepts: [
      "Conflict Resolution Styles (Thomas-Kilmann)",
      "Negotiation Styles",
      "Mediation Techniques",
      "Win-Win Negotiation",
      "Difficult Conversations"
    ]
  },
  {
    name: 'Decision Making & Problem Solving',
    concepts: [
      "Critical Thinking",
      "Decision-Making Models",
      "Problem-Solving Frameworks",
      "Systems Thinking",
      "Creative Problem Solving"
    ]
  },
  {
    name: 'Personal Development',
    concepts: [
      "Cultural Intelligence (CQ)",
      "Personality Types (Big Five, DISC)",
      "Core Values Frameworks",
      "Self-Awareness",
      "Stress Management",
      "Time Management"
    ]
  }
];

// Helper function to get all concepts for a domain
export const getConceptsForDomain = (domain: string): ConceptCategory[] => {
  return domainConcepts[domain] || [];
};

// Helper function to get all concepts as a flat array
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

// Helper function to get random personal skills
export const getRandomPersonalSkills = (count: number = 1): string[] => {
  const allPersonalSkills = personalSkillsConcepts.flatMap(category => category.concepts);
  const shuffled = allPersonalSkills.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};