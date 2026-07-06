import databaseService from './databaseService.js';
import fs from 'fs/promises';

// Hardcoded technology databases for the offline rule-based AI engine
const INDUSTRY_TRENDS = [
  { name: 'TypeScript', category: 'Frontend', demand: 'High', reason: 'Industry standard for type safety in modern JavaScript projects.' },
  { name: 'Next.js', category: 'Frontend', demand: 'Critical', reason: 'Dominant React framework for SSR, static generation, and SEO optimization.' },
  { name: 'Docker', category: 'Tools', demand: 'High', reason: 'Essential for containerizing full-stack apps for consistent deployment.' },
  { name: 'GraphQL', category: 'Backend', demand: 'Medium', reason: 'Increasingly preferred for custom mobile/web client query layouts.' },
  { name: 'AWS / Cloud', category: 'Tools', demand: 'Critical', reason: 'Cloud hosting providers (AWS, Azure) are standard for modern enterprise architectures.' },
  { name: 'Redis', category: 'Backend', demand: 'High', reason: 'Crucial for caching and scaling Node.js session stores.' },
  { name: 'Jest / Testing Library', category: 'Tools', demand: 'High', reason: 'Ensures CI/CD safety and component regression prevention.' }
];

const SUGGESTED_CERTIFICATIONS = [
  { name: 'AWS Certified Cloud Practitioner', domain: 'Cloud Computing' },
  { name: 'Meta Front-End Developer Certificate', domain: 'React & Frontend' },
  { name: 'MongoDB Certified Developer Associate', domain: 'Databases' },
  { name: 'Google UX Design Professional Certificate', domain: 'UI/UX' }
];

class AIService {
  // Method to query OpenAI
  async queryOpenAI(apiKey, prompt) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API responded with code: ${response.status}`);
      }

      const resData = await response.json();
      return JSON.parse(resData.choices[0].message.content);
    } catch (err) {
      console.warn('OpenAI query failed, falling back to local analysis.', err.message);
      return null;
    }
  }

  // Method to query Google Gemini
  async queryGemini(apiKey, prompt) {
    try {
      // Standard v1beta model endpoint for Gemini Flash/Pro
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt + '\nReturn response in valid JSON format.' }] }],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API responded with code: ${response.status}`);
      }

      const resData = await response.json();
      const text = resData.candidates[0].content.parts[0].text;
      return JSON.parse(text);
    } catch (err) {
      console.warn('Gemini query failed, falling back to local analysis.', err.message);
      return null;
    }
  }

  // Method to query Ollama (offline local LLM)
  async queryOllama(hostUrl = 'http://localhost:11434', prompt) {
    try {
      const response = await fetch(`${hostUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama3', // default model
          prompt: prompt,
          format: 'json',
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama responded with code: ${response.status}`);
      }

      const resData = await response.json();
      return JSON.parse(resData.response);
    } catch (err) {
      console.warn('Ollama local LLM query failed. Make sure Ollama server is running. Falling back to local analysis.', err.message);
      return null;
    }
  }

  // Compute offline static portfolio analysis
  async runOfflinePortfolioAnalysis(data) {
    const { profile, projects, skills, experience, education, certificates, achievements } = data;

    // 1. Calculate Portfolio Health Score (0-100)
    let score = 0;
    const details = [];

    if (profile && profile.name) { score += 10; details.push('Profile details completed (+10)'); }
    if (profile && (profile.github || profile.linkedin)) { score += 10; details.push('Social links linked (+10)'); }
    
    const projectCount = projects ? projects.length : 0;
    const projectScore = Math.min(projectCount * 5, 25);
    score += projectScore;
    if (projectScore > 0) details.push(`Showcasing ${projectCount} projects (+${projectScore})`);

    const skillsCount = skills ? skills.length : 0;
    const skillsScore = Math.min(skillsCount * 1, 20);
    score += skillsScore;
    if (skillsScore > 0) details.push(`Listed ${skillsCount} technical skills (+${skillsScore})`);

    const expCount = experience ? experience.length : 0;
    const expScore = Math.min(expCount * 5, 15);
    score += expScore;
    if (expScore > 0) details.push(`Logged ${expCount} career history entries (+${expScore})`);

    const certCount = certificates ? certificates.length : 0;
    const certScore = Math.min(certCount * 2, 10);
    score += certScore;
    if (certScore > 0) details.push(`Verified ${certCount} industry certificates (+${certScore})`);

    const achCount = achievements ? achievements.length : 0;
    const achScore = Math.min(achCount * 2, 10);
    score += achScore;
    if (achScore > 0) details.push(`Added ${achCount} hackathons/awards (+${achScore})`);

    // 2. Skill Gap Analysis
    const currentSkillNames = new Set((skills || []).map(s => s.name.toLowerCase()));
    const missingSkills = [];
    const trendingSkills = [];

    INDUSTRY_TRENDS.forEach(trend => {
      if (!currentSkillNames.has(trend.name.toLowerCase())) {
        missingSkills.push(trend.name);
        trendingSkills.push(trend);
      }
    });

    // 3. Project description enhance check
    const projectAudits = [];
    (projects || []).forEach(proj => {
      const wordCount = proj.description ? proj.description.split(/\s+/).length : 0;
      if (wordCount < 15) {
        projectAudits.push({
          id: proj.id,
          title: proj.title,
          status: 'Weak Description',
          suggestion: `Expand description for '${proj.title}'. Use impact verbs (e.g., 'Engineered', 'Optimized', 'Architected') and state measurable metrics.`
        });
      }
    });

    // 4. Synthesize recommendations
    const recommendations = [];
    const strengths = [];
    const weaknesses = [];
    const action_items = [];

    if (score < 50) {
      weaknesses.push('Portfolio structure is incomplete. Critical metadata like certificates and social presence are missing.');
      recommendations.push('Complete the profile links and log at least 3 detailed projects.');
    } else {
      strengths.push('Portfolio structure is robust. Good balance of projects, education details, and professional experience.');
    }

    if (missingSkills.length > 0) {
      weaknesses.push(`Gaps identified in trending development stacks: ${missingSkills.slice(0, 3).join(', ')}.`);
      action_items.push(`Add ${missingSkills[0]} to your learning pathway.`);
    }

    if (projectAudits.length > 0) {
      weaknesses.push(`${projectAudits.length} projects have weak description profiles.`);
      projectAudits.slice(0, 2).forEach(audit => {
        action_items.push(audit.suggestion);
      });
    }

    // Default suggestions list
    SUGGESTED_CERTIFICATIONS.forEach(cert => {
      recommendations.push(`Earn the ${cert.name} to bolster credibility in ${cert.domain}.`);
    });

    // Final compiled report
    return {
      score,
      details,
      missingSkills,
      trendingSkills,
      projectAudits,
      strengths,
      weaknesses,
      recommendations,
      action_items,
      learningRoadmap: missingSkills.map((s, idx) => ({
        step: idx + 1,
        skill: s,
        topics: idx === 0 ? ['Fundamentals', 'Syntax', 'Framework Integration'] : ['Setup', 'Advanced Routing', 'Production Build'],
        duration: '2-3 Weeks'
      }))
    };
  }

  // Compute offline ATS resume parser
  async runOfflineATSResumeAnalysis(filePath) {
    let textContent = '';
    let fileFormat = 'Unknown';
    let fileSize = 0;

    try {
      const buffer = await fs.readFile(filePath);
      fileSize = buffer.length;
      textContent = buffer.toString('utf8');

      // Check header format
      if (textContent.startsWith('%PDF')) {
        fileFormat = 'PDF';
      } else if (filePath.endsWith('.docx')) {
        fileFormat = 'DOCX';
      } else if (filePath.endsWith('.txt')) {
        textContent = buffer.toString('utf-8');
        fileFormat = 'TXT';
      } else {
        fileFormat = 'Binary/Unknown';
      }
    } catch (err) {
      console.warn('Could not read uploaded resume file for ATS parsing:', err.message);
      textContent = '';
    }

    // Setup scanning keywords
    const keywords = [
      'Education', 'Experience', 'Projects', 'Skills', 'Contact', 'React', 'Node.js',
      'JavaScript', 'SQL', 'B.Tech', 'Developer', 'Git', 'GitHub', 'Backend', 'Frontend'
    ];

    const foundKeywords = [];
    const missingKeywords = [];

    keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      if (regex.test(textContent)) {
        foundKeywords.push(kw);
      } else {
        missingKeywords.push(kw);
      }
    });

    // Score calculations
    let score = 50; // starting base score
    const layoutIssues = [];
    const strengths = [];
    const suggestions = [];

    // format checks
    if (fileFormat === 'PDF') {
      score += 15;
      strengths.push('Resume uploaded in standard PDF formatting. Ideal for parsing software.');
    } else if (fileFormat === 'DOCX') {
      score += 10;
      strengths.push('Resume uploaded in standard Microsoft Word formatting.');
    } else {
      layoutIssues.push('Format mismatch. We recommend PDF format over miscellaneous binary extensions.');
    }

    // size checks
    if (fileSize > 5 * 1024 * 1024) {
      layoutIssues.push('File size exceeds 5MB. Large files containing uncompressed vector graphics may clog corporate ATS queues.');
      score -= 5;
    } else {
      strengths.push('File size is compact (under 5MB), loading swiftly.');
    }

    // Section traces
    const hasEducation = /education|college|university|b\.tech|school/gi.test(textContent);
    const hasExperience = /experience|employment|work|intern|freelance/gi.test(textContent);
    const hasSkills = /skills|technologies|proficiencies/gi.test(textContent);

    if (hasEducation) { score += 10; strengths.push('Identified distinct "Education" credentials.'); }
    else { score -= 10; layoutIssues.push('Missing explicit "Education" heading block.'); }

    if (hasExperience) { score += 15; strengths.push('Identified structured "Experience" log.'); }
    else { score -= 15; layoutIssues.push('Missing explicit "Experience" or career history heading.'); }

    if (hasSkills) { score += 10; strengths.push('Identified "Skills" index table.'); }
    else { score -= 10; layoutIssues.push('Missing explicit technical "Skills" summary list.'); }

    // Keyword density checks
    if (foundKeywords.length > 8) {
      score += 10;
      strengths.push('Excellent keyword matches for full-stack candidate profiles.');
    } else {
      score -= 5;
      suggestions.push(`Integrate relevant technical keywords into your resume body: ${missingKeywords.slice(0, 4).join(', ')}.`);
    }

    score = Math.max(0, Math.min(100, score));

    return {
      score,
      fileFormat,
      fileSize: `${(fileSize / 1024).toFixed(1)} KB`,
      foundKeywords,
      missingKeywords,
      layoutIssues,
      strengths,
      suggestions,
      suggestedSummary: `Result-driven Full-stack Developer with B.Tech degree in Information Technology. Specialized in creating reactive Single Page Applications using React.js and scaling backends with Node.js/Express. Handled MySQL data optimization and automated deployment pipelines.`
    };
  }

  // Unified endpoint selector
  async analyzePortfolio() {
    // Gather database state
    const profile = await databaseService.getProfile();
    const projects = await databaseService.getProjects();
    const skills = await databaseService.getSkills();
    const experience = await databaseService.getExperiences();
    const education = await databaseService.getEducation();
    const certificates = await databaseService.getCertificates();
    const achievements = await databaseService.getAchievements();

    const data = { profile, projects, skills, experience, education, certificates, achievements };

    // Get active settings provider
    const settings = await databaseService.getSettings();
    const provider = settings.ai_provider || 'offline';
    const openaiKey = settings.openai_key || process.env.OPENAI_API_KEY;
    const geminiKey = settings.gemini_key || process.env.GEMINI_API_KEY;
    const ollamaHost = settings.ollama_host || process.env.OLLAMA_HOST || 'http://localhost:11434';

    let result = null;

    const basePrompt = `
      You are an expert technical portfolio reviewer and ATS optimizer.
      Review the following developer portfolio data and provide a detailed analysis in JSON format.
      Portfolio Data: ${JSON.stringify(data)}
      
      Respond with this exact JSON format:
      {
        "score": 85, // integer 0-100
        "strengths": ["string"],
        "weaknesses": ["string"],
        "recommendations": ["string"],
        "action_items": ["string"],
        "missingSkills": ["string"],
        "learningRoadmap": [{"step": 1, "skill": "string", "topics": ["string"], "duration": "string"}]
      }
    `;

    if (provider === 'openai' && openaiKey) {
      console.log('🤖 Querying OpenAI Assistant API...');
      result = await this.queryOpenAI(openaiKey, basePrompt);
    } else if (provider === 'gemini' && geminiKey) {
      console.log('🤖 Querying Google Gemini API...');
      result = await this.queryGemini(geminiKey, basePrompt);
    } else if (provider === 'ollama') {
      console.log(`🤖 Querying Ollama Local model at ${ollamaHost}...`);
      result = await this.queryOllama(ollamaHost, basePrompt);
    }

    if (!result) {
      console.log('🤖 Executing Offline Rule-based AI Engine...');
      result = await this.runOfflinePortfolioAnalysis(data);
    }

    // Cache the suggestion in DB for instant lookup
    await databaseService.createAISuggestion({
      suggestionType: 'portfolio',
      score: result.score,
      recommendations: result.recommendations,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      action_items: result.action_items
    });

    return result;
  }
}

const aiService = new AIService();
export default aiService;
