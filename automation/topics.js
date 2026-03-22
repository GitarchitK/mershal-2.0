// Tech & Programming Topics - Niche: Technology, Coding, Apps, Tutorials
export const customTopics = [
  // Programming & Coding Tutorials
  { topic: 'How to learn Python in 2026 - Complete beginner guide', category: 'technology' },
  { topic: 'JavaScript vs TypeScript - Which one should you learn', category: 'technology' },
  { topic: 'Build your first web app with React - Step by step tutorial', category: 'technology' },
  { topic: 'Master CSS Grid and Flexbox - Modern layout techniques', category: 'technology' },
  { topic: 'Learn Node.js backend development from scratch', category: 'technology' },
  { topic: 'Python automation scripts for everyday tasks', category: 'technology' },
  { topic: 'Git and GitHub tutorial for beginners', category: 'technology' },
  { topic: 'How to deploy a website using Vercel for free', category: 'technology' },
  { topic: 'Build a REST API with Express and MongoDB', category: 'technology' },
  { topic: 'SQL vs NoSQL databases - When to use which', category: 'technology' },
  
  // App Development
  { topic: 'How to build a mobile app with Flutter - Complete guide', category: 'technology' },
  { topic: 'iOS app development with Swift - Getting started', category: 'technology' },
  { topic: 'Android app development with Kotlin tutorial', category: 'technology' },
  { topic: 'Build a cross-platform app with React Native', category: 'technology' },
  { topic: 'Progressive Web Apps (PWA) - The future of web apps', category: 'technology' },
  
  // Computer Hardware & Reviews
  { topic: 'Best laptops for programming in 2026 - Detailed review', category: 'technology' },
  { topic: 'Build your own PC for coding - Component guide', category: 'technology' },
  { topic: 'SSD vs HDD - What programmers need to know', category: 'technology' },
  { topic: 'Best monitors for developers in 2026', category: 'technology' },
  { topic: 'Mechanical keyboards for coding - Are they worth it', category: 'technology' },
  
  // Software & Tools
  { topic: 'VS Code extensions every developer should use', category: 'technology' },
  { topic: 'Best code editors in 2026 - VS Code vs others', category: 'technology' },
  { topic: 'Docker tutorial for beginners - Containerization explained', category: 'technology' },
  { topic: 'Kubernetes explained simply - Container orchestration', category: 'technology' },
  { topic: 'Linux commands every developer must know', category: 'technology' },
  
  // AI & Machine Learning
  { topic: 'How to get started with machine learning in Python', category: 'technology' },
  { topic: 'ChatGPT API tutorial - Build AI-powered apps', category: 'technology' },
  { topic: 'TensorFlow vs PyTorch - Which one to choose', category: 'technology' },
  { topic: 'Build your first AI model without coding experience', category: 'technology' },
  { topic: 'The future of AI in software development', category: 'technology' },
  
  // Web Development
  { topic: 'HTML5 and CSS3 modern features tutorial', category: 'technology' },
  { topic: 'Responsive web design best practices 2026', category: 'technology' },
  { topic: 'Next.js vs Gatsby - Static site generators compared', category: 'technology' },
  { topic: 'Web accessibility tutorial - Make your site accessible', category: 'technology' },
  { topic: 'Speed up your website - Performance optimization guide', category: 'technology' },
  
  // Cybersecurity
  { topic: 'Basic cybersecurity practices for developers', category: 'technology' },
  { topic: 'How to secure your web applications', category: 'technology' },
  { topic: 'Understanding OAuth 2.0 - Authentication explained', category: 'technology' },
  { topic: 'Password security best practices 2026', category: 'technology' },
  { topic: 'Two-factor authentication setup guide', category: 'technology' },
  
  // Career & Jobs
  { topic: 'How to become a software developer in 2026', category: 'technology' },
  { topic: 'Freelance programming jobs - How to get started', category: 'technology' },
  { topic: 'Software developer salary guide 2026', category: 'technology' },
  { topic: 'Building a developer portfolio that gets jobs', category: 'technology' },
  { topic: 'Tech interview preparation - LeetCode vs real skills', category: 'technology' },
  
  // Tech News & Trends
  { topic: 'Tech industry layoffs 2026 - What developers need to know', category: 'technology' },
  { topic: 'The rise of AI coding assistants - Copilot vs others', category: 'technology' },
  { topic: 'Web3 and blockchain development - Is it worth learning', category: 'technology' },
  { topic: 'The future of programming languages 2026', category: 'technology' },
  { topic: 'Remote work trends in tech industry', category: 'technology' },
  
  // How-To & Tutorials
  { topic: 'How to set up a home lab for learning DevOps', category: 'technology' },
  { topic: 'Build a personal VPN for privacy and security', category: 'technology' },
  { topic: 'Create a blog with Hugo static site generator', category: 'technology' },
  { topic: 'Set up automated testing in your CI/CD pipeline', category: 'technology' },
  { topic: 'How to contribute to open source projects', category: 'technology' },
];

export const yourCustomTopics = [];

export const allTopics = [...customTopics, ...yourCustomTopics];

export function getRandomTopics(count = 1) {
  const shuffled = [...allTopics].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function getTopicsByCategory(category) {
  return allTopics.filter(t => t.category === category);
}

export function addTopic(topic, category) {
  yourCustomTopics.push({ topic, category });
  allTopics.push({ topic, category });
}