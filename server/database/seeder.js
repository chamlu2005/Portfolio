import bcrypt from 'bcryptjs';
import databaseService from '../services/databaseService.js';

export const seedDatabase = async () => {
  try {
    console.log('🌱 Checking if database needs seeding...');
    
    // Check if admin user exists
    const adminUser = await databaseService.getUserByEmail('danielpaul2285@gmail.com');
    if (adminUser) {
      console.log('✅ Database is already seeded.');
      return;
    }

    console.log('🌱 Starting database seeding process...');

    // 1. Create Admin User
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);
    await databaseService.createUser('danielpaul2285@gmail.com', passwordHash, 'admin');
    console.log('👤 Admin user created');

    // 2. Seed Profile
    await databaseService.updateProfile({
      name: 'Daniel Paul S',
      role_summary: 'Full Stack Engineer | React & Node.js Developer | Cloud Enthusiast',
      bio: 'I am a passionate software engineer specializing in developing premium web applications using React, Node.js, Express, and cloud native architectures. With hands-on experience in full-stack engineering, databases, and continuous learning, I love building robust, secure, and user-centric systems.',
      age: 21,
      location: 'Coimbatore, Tamil Nadu',
      degree: 'B.Tech Information Technology',
      cgpa: 6.5,
      languages: 'English, Tamil',
      interests: 'Web Application Architectures, Cloud computing, UI/UX Design, Open Source',
      resume_url: '',
      avatar_url: '/assets/images/profile.png',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      instagram: 'https://instagram.com',
      email: 'danielpaul2285@gmail.com'
    });
    console.log('📝 Seeded profile details.');

    // 3. Seed Skills (25 Skills mapped to requests)
    const skills = [
      // Programming Languages
      { name: 'C', category: 'Programming Languages', proficiency: 80, icon: 'Code' },
      { name: 'C++', category: 'Programming Languages', proficiency: 82, icon: 'Code' },
      { name: 'Java', category: 'Programming Languages', proficiency: 88, icon: 'Java' },
      { name: 'Python', category: 'Programming Languages', proficiency: 85, icon: 'Python' },
      { name: 'JavaScript', category: 'Programming Languages', proficiency: 90, icon: 'Javascript' },

      // Frontend
      { name: 'HTML5', category: 'Frontend', proficiency: 95, icon: 'Html5' },
      { name: 'CSS3', category: 'Frontend', proficiency: 92, icon: 'Css3' },
      { name: 'React.js', category: 'Frontend', proficiency: 90, icon: 'React' },
      { name: 'Tailwind CSS', category: 'Frontend', proficiency: 88, icon: 'Tailwind' },
      { name: 'Bootstrap', category: 'Frontend', proficiency: 85, icon: 'Bootstrap' },

      // Backend
      { name: 'Node.js', category: 'Backend', proficiency: 85, icon: 'Node' },
      { name: 'Express.js', category: 'Backend', proficiency: 83, icon: 'Express' },
      { name: 'Spring Boot', category: 'Backend', proficiency: 80, icon: 'Spring' },

      // Databases
      { name: 'MySQL', category: 'Databases', proficiency: 88, icon: 'Mysql' },
      { name: 'Firebase', category: 'Databases', proficiency: 82, icon: 'Firebase' },
      { name: 'MongoDB', category: 'Databases', proficiency: 80, icon: 'Database' },
      { name: 'PostgreSQL', category: 'Databases', proficiency: 85, icon: 'Database' },

      // Tools
      { name: 'Git', category: 'Tools', proficiency: 85, icon: 'Git' },
      { name: 'GitHub', category: 'Tools', proficiency: 88, icon: 'Github' },
      { name: 'VS Code', category: 'Tools', proficiency: 95, icon: 'Vscode' },
      { name: 'Postman', category: 'Tools', proficiency: 85, icon: 'Command' },
      { name: 'Figma', category: 'Tools', proficiency: 80, icon: 'Figma' },
      { name: 'SQL Workbench', category: 'Tools', proficiency: 82, icon: 'Database' },

      // Cloud & DevOps
      { name: 'AWS', category: 'Cloud & DevOps', proficiency: 78, icon: 'Aws' },
      { name: 'Docker', category: 'Cloud & DevOps', proficiency: 80, icon: 'Cpu' },
      { name: 'Vercel', category: 'Cloud & DevOps', proficiency: 90, icon: 'Globe' },

      // Soft Skills
      { name: 'Problem Solving', category: 'Soft Skills', proficiency: 90, icon: 'Brain' },
      { name: 'Team Collaboration', category: 'Soft Skills', proficiency: 92, icon: 'Users' },
      { name: 'Communication', category: 'Soft Skills', proficiency: 88, icon: 'Message' }
    ];
    for (const skill of skills) {
      await databaseService.createSkill(skill);
    }
    console.log('📝 Seeded skills.');
    
    // 4. Seed Projects (6 Projects mapped to requests)
    const projects = [
      {
        title: 'AI Chat Application',
        description: 'An intelligent real-time chat application powered by OpenAI GPT-4 API. Built supporting streaming text responses, custom system role prompts, dialogue history session logs, database backup threads, secure JWT session cookies, and responsive glassmorphism views.',
        image: '/assets/images/profile.png',
        github_url: 'https://github.com',
        demo_url: 'https://demo.com',
        tags: 'React, Node.js, Express, OpenAI API, JWT, Tailwind CSS',
        category: 'AI / ML'
      },
      {
        title: 'E-Commerce Platform',
        description: 'A modern e-commerce application featuring product catalog browsing, advanced search sorting, dynamic checkout cart, Stripe payment gateway integrations, admin product inventory dashboards, and user order logs.',
        image: '/assets/images/profile.png',
        github_url: 'https://github.com',
        demo_url: 'https://demo.com',
        tags: 'React, Spring Boot, MySQL, Stripe API, Redux Toolkit',
        category: 'Web Application'
      },
      {
        title: 'Personal Portfolio Content Management System',
        description: 'A content management system allowing dynamic updates to projects, skills, certifications, and achievements. Supports secure administrator authentication, file upload capabilities, downloadable resumes, and visitor tracking dashboards.',
        image: 'https://media.licdn.com/dms/image/v2/D4E12AQFG_bRKMWbgTg/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1739245056904?e=2147483647&v=beta&t=bDkeH2W5Nbj-grYTJKEYQo_d2YA3EEcctExhpDAWEas',
        github_url: 'https://github.com',
        demo_url: 'https://demo.com',
        tags: 'React.js, Node.js, Express, Firebase, JWT, Netlify',
        category: 'Full Stack'
      },
      {
        title: 'Hospital Management System',
        description: 'An enterprise healthcare dashboard for managing patient medical records, doctor scheduling, dynamic appointment booking, prescription logs, inventory billing, and role-based staff portals.',
        image: '/assets/images/profile.png',
        github_url: 'https://github.com',
        demo_url: 'https://demo.com',
        tags: 'React, Node.js, Express, MySQL, Material UI, JWT',
        category: 'Web Application'
      },
      {
        title: 'Task Management App',
        description: 'A collaborative Kanban task management platform inspired by Trello. Enables team workspaces, dragging-and-dropping task cards, assigning card checklists, setting alert deadlines, and real-time socket modifications.',
        image: '/assets/images/profile.png',
        github_url: 'https://github.com',
        demo_url: 'https://demo.com',
        tags: 'React, Node.js, Socket.io, MongoDB, Tailwind CSS, Framer Motion',
        category: 'Full Stack'
      },
      {
        title: 'Weather Dashboard',
        description: 'A real-time weather dashboard pulling meteorological metrics from the OpenWeatherMap API. Features location autocomplete search, interactive temperature history charts, humidity logs, UV indexes, and 7-day local forecasts.',
        image: '/assets/images/profile.png',
        github_url: 'https://github.com',
        demo_url: 'https://demo.com',
        tags: 'React, OpenWeatherMap API, Chart.js, CSS3, Responsive Design',
        category: 'Web Application'
      }
    ];
    for (const project of projects) {
      await databaseService.createProject(project);
    }
    console.log('📝 Seeded projects.');

    // 5. Seed Experience (3 Experiences mapped to requests)
    const experiences = [
      {
        company: 'Grevya Technologies',
        role: 'Full Stack Engineer Intern',
        location: 'Coimbatore, India',
        start_date: 'Feb 2026',
        end_date: 'June 2026',
        description: 'Developed modern web applications using React and Firebase. Worked on responsive UI development and CMS implementation. Collaborated using Git and GitHub. Participated in debugging, testing, and deployment. Improved application performance and user experience.',
        current: false
      },
      {
        company: 'AJ & VG Media Pvt Ltd',
        role: 'Software Developer Intern',
        location: 'Coimbatore, India',
        start_date: 'May 2025',
        end_date: 'Oct 2025',
        description: 'Developed ERP & CRM Jewellery Management System. Built Inventory Module, Sales Module, Billing Module, and Customer Management. Implemented Gold Weight Tracking and SQL CRUD Operations.',
        current: false
      },
      {
        company: 'TechVantage Solutions',
        role: 'Junior Web Developer',
        location: 'Remote',
        start_date: 'Nov 2024',
        end_date: 'Apr 2025',
        description: 'Created highly responsive landing pages and customized theme components using HTML5, CSS3, and JavaScript. Optimized site load times, maintained server deployments, and executed database backups.',
        current: false
      }
    ];
    for (const exp of experiences) {
      await databaseService.createExperience(exp);
    }
    console.log('📝 Seeded experiences.');

    // 6. Seed Education (3 Educations mapped to requests)
    const educations = [
      {
        institution: 'Dr. Mahalingam College of Engineering and Technology',
        degree: 'Bachelor of Technology',
        field: 'Information Technology',
        start_date: '2023',
        end_date: '2027',
        grade: 'CGPA: 6.5'
      },
      {
        institution: 'Bharani Park Matric Hr.Sec.School',
        degree: 'Higher Secondary',
        field: 'Computer Science',
        start_date: '2021',
        end_date: '2023',
        grade: '90%'
      },
      {
        institution: 'Bharani Park Matric Hr.Sec.School',
        degree: 'High School',
        field: 'General Education',
        start_date: '2019',
        end_date: '2021',
        grade: '92%'
      }
    ];
    for (const edu of educations) {
      await databaseService.createEducation(edu);
    }
    console.log('📝 Seeded education.');

    // 7. Seed Certificates (8 Certificates mapped to requests)
    const certificates = [
      { title: 'Java Programming Masterclass', issuer: 'Udemy / Oracle Academy', issue_date: '2024', verification_url: 'https://verification.com', credential_id: 'JV-2024' },
      { title: 'Python for Data Science', issuer: 'IBM / Coursera', issue_date: '2024', verification_url: 'https://verification.com', credential_id: 'PYDS-2024' },
      { title: 'Responsive Web Development', issuer: 'freeCodeCamp', issue_date: '2024', verification_url: 'https://verification.com', credential_id: 'FCC-RWD' },
      { title: 'React Developer Certification', issuer: 'Meta / Coursera', issue_date: '2025', verification_url: 'https://verification.com', credential_id: 'META-REACT' },
      { title: 'SQL & Database Administration', issuer: 'Oracle / Udemy', issue_date: '2024', verification_url: 'https://verification.com', credential_id: 'SQL-DBA' },
      { title: 'UI/UX Design using Figma', issuer: 'Figma Academy', issue_date: '2025', verification_url: 'https://verification.com', credential_id: 'FIG-UIUX' },
      { title: 'Git & GitHub Professional', issuer: 'Atlassian / Coursera', issue_date: '2024', verification_url: 'https://verification.com', credential_id: 'GIT-PRO' },
      { title: 'Machine Learning Fundamentals', issuer: 'Stanford / Coursera', issue_date: '2025', verification_url: 'https://verification.com', credential_id: 'STAN-ML' }
    ];
    for (const cert of certificates) {
      await databaseService.createCertificate(cert);
    }
    console.log('📝 Seeded certificates.');

    // 8. Seed Achievements (9 Achievements mapped to requests)
    const achievements = [
      { title: 'Smart India Hackathon Participant', organization: 'Govt of India', date: '2025', description: 'Participated in the national level Smart India Hackathon solving enterprise problem statements.', type: 'Hackathon' },
      { title: 'Coding Competition Winner', organization: 'CodeChef College Chapter', date: '2024', description: 'Secured 1st place in the college-level programming competition.', type: 'Competition' },
      { title: 'Open Source Contributor', organization: 'GitHub / Vite', date: '2025', description: 'Contributed documentation fixes and core translations to several open source modules.', type: 'Contribution' },
      { title: 'Full Stack Developer Certification', organization: 'DevAcademy', date: '2025', description: 'Completed intensive full stack development program covering React and Spring Boot.', type: 'Certification' },
      { title: 'AI Project Completion', organization: 'Self-directed', date: '2025', description: 'Successfully engineered and deployed an OpenAI GPT-4 API chat application.', type: 'Project' },
      { title: 'Dean\'s List', organization: 'Dr. MCET Academic Office', date: '2024', description: 'Received certificates of academic excellence for staying in top ranking divisions.', type: 'Academic' },
      { title: 'Research Publication', organization: 'IEEE Student Conference', date: '2025', description: 'Published a paper investigating the applications of IoT systems in smart environment sensors.', type: 'Academic' },
      { title: 'Technical Workshop Participation', organization: 'AWS User Group India', date: '2024', description: 'Attended full-day training workshops covering AWS cloud deployment architecture practices.', type: 'Event' },
      { title: 'Leadership Award', organization: 'SKCT Tech Club', date: '2024', description: 'Honored as the lead coordinator managing campus hackathon activities and events.', type: 'Award' }
    ];
    for (const ach of achievements) {
      await databaseService.createAchievement(ach);
    }
    console.log('📝 Seeded achievements.');

    // 9. Seed Testimonials
    const testimonials = [
      { client_name: 'Sarah Jenkins', position: 'Senior Talent Partner', company: 'Google Cloud APAC', feedback: 'Daniel is an exceptional student with a strong grasp of Full Stack Development and IoT. His Accident Detection project showcased great problem-solving skills.', rating: 5, image: '/assets/images/profile.png' }
    ];
    for (const test of testimonials) {
      await databaseService.createTestimonial(test);
    }

    // 10. Seed Settings
    await databaseService.updateSetting('theme', 'dark');
    await databaseService.updateSetting('ai_provider', 'offline');
    await databaseService.updateSetting('openai_key', '');
    await databaseService.updateSetting('gemini_key', '');
    await databaseService.updateSetting('ollama_host', 'http://localhost:11434');

    // Create system notification
    await databaseService.createNotification('🎉 Portfolio database seeded successfully! Welcoming Daniel Paul.', 'system');

    console.log('✅ Seeding completed successfully!');
  } catch (err) {
    console.error('❌ Critical: Database seeding failed.', err);
  }
};
