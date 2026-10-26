export interface Profile {
  name: string;
  headline: string;
  bio: string;
  location: string;
  email: string;
  linkedinUrl: string;
  githubUrl: string;
  resumeFile: string;
  skills: {
    languages: string[];
    dataAnalytics: string[];
    aiAndML: string[];
    toolsAndCloud: string[];
  };
}

export interface Experience {
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  order: number;
  summary: string;
  achievements: string[];
  skills: string[];
}

export interface Project {
  slug: string;
  title: string;
  category: 'data-analytics' | 'ai-ml';
  description: string;
  repoUrl: string;
  demoUrl?: string;
  featured: boolean;
  order: number;
  published: boolean;
  stars: number;
  forks: number;
  topics: string[];
  techStack: string[];
  readmeMarkdown: string;
}

export interface Certification {
  id?: string;
  title: string;
  issuer: string;
  issueDate?: string;
  credentialUrl?: string;
  category?: 'data-analytics' | 'ai-ml';
  published: boolean;
  order: number;
}