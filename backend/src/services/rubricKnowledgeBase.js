export const RUBRIC_KNOWLEDGE_BASE = {
  smart_india_hackathon: {
    name: "Smart India Hackathon (SIH) Rubric",
    weights: {
      "Problem Impact & Relevance": 25,
      "Technical Complexity & Execution": 25,
      "Innovation & Novelty": 20,
      "Scalability & Feasibility": 15,
      "UX & Presentation": 15
    },
    typical_judge_questions: [
      "How does this solution handle offline mode or low connectivity in rural areas?",
      "What public APIs or government portal integrations are required, and are they fully operational?",
      "How does your team scale server resources when 10,000 users access the portal simultaneously?",
      "What is the ongoing operational cost, and how does the model sustain itself after grants finish?"
    ]
  },
  mlh_hackathon: {
    name: "Major League Hacking (MLH) Rubric",
    weights: {
      "Learning & Growth": 25,
      "Technical Execution": 25,
      "Design & User Experience": 25,
      "Originality & Creativity": 25
    },
    typical_judge_questions: [
      "What was the most challenging technical bug you encountered, and how did you resolve it?",
      "Did you learn to use any new library, framework, or API specifically for this hackathon?",
      "How does your design make the user experience intuitive for a non-technical audience?",
      "What is the single most creative element of your solution that sets it apart?"
    ]
  },
  social_impact: {
    name: "Social Impact & Sustainability Rubric",
    weights: {
      "Social Impact & Target Reach": 30,
      "Novelty & Innovation": 20,
      "Technical Feasibility": 20,
      "Economic Viability": 20,
      "Presentation Quality": 10
    },
    typical_judge_questions: [
      "How does your solution directly improve the day-to-day lives of the affected demographic?",
      "How accessible is your application to elderly or disabled individuals?",
      "What is the environmental footprint of your technical setup (e.g. server energy usage)?",
      "Is the solution culturally appropriate for the local communities you are deploying in?"
    ]
  },
  corporate_innovation: {
    name: "Corporate Innovation & Viability Rubric",
    weights: {
      "Technical Complexity & Robustness": 30,
      "Business Model & Market Alignment": 25,
      "Innovation & Competitive Moat": 20,
      "Demo Completeness & UX": 15,
      "Team Skills & Presentation": 10
    },
    typical_judge_questions: [
      "What is your unique competitive moat or intellectual property protection?",
      "What are the unit economics of your service, and how long until the venture breaks even?",
      "What industry standards or compliance rules (e.g., GDPR, PCI-DSS) does your transaction layer follow?",
      "How did your team divide responsibilities, and how did you test integration between modules?"
    ]
  }
};
