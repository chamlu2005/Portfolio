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
      role_summary: 'Full Stack Developer | React Developer | AI & IoT Enthusiast',
      bio: 'I am an Information Technology undergraduate passionate about Full Stack Development, React.js, Node.js, Express, AI, IoT, and modern web technologies. I enjoy developing responsive applications, learning new technologies, and building products that create real-world impact.',
      age: 21,
      location: 'Coimbatore, Tamil Nadu',
      degree: 'B.Tech Information Technology',
      cgpa: 6.5,
      languages: 'English, Tamil',
      interests: 'React, Node.js, Express, IoT, AI, Full Stack Development',
      resume_url: '',
      avatar_url: '/assets/images/profile.png',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      instagram: 'https://instagram.com',
      email: 'danielpaul2285@gmail.com'
    });
    console.log('📝 Seeded profile details.');

    // 3. Seed Skills
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

      // Database
      { name: 'MySQL', category: 'Database', proficiency: 88, icon: 'Mysql' },
      { name: 'Firebase', category: 'Database', proficiency: 82, icon: 'Firebase' },
      { name: 'MongoDB', category: 'Database', proficiency: 80, icon: 'Database' },

      // Tools
      { name: 'Git', category: 'Tools', proficiency: 85, icon: 'Git' },
      { name: 'GitHub', category: 'Tools', proficiency: 88, icon: 'Github' },
      { name: 'VS Code', category: 'Tools', proficiency: 95, icon: 'Vscode' },
      { name: 'Postman', category: 'Tools', proficiency: 85, icon: 'Command' },
      { name: 'Figma', category: 'Tools', proficiency: 80, icon: 'Figma' },
      { name: 'SQL Workbench', category: 'Tools', proficiency: 82, icon: 'Database' },

      // Concepts
      { name: 'Data Structures & Algorithms', category: 'Concepts', proficiency: 88, icon: 'Brain' },
      { name: 'OOP', category: 'Concepts', proficiency: 90, icon: 'Award' },
      { name: 'DBMS', category: 'Concepts', proficiency: 85, icon: 'Database' },
      { name: 'Operating Systems', category: 'Concepts', proficiency: 82, icon: 'Cpu' },
      { name: 'Computer Networks', category: 'Concepts', proficiency: 80, icon: 'Globe' },
      { name: 'REST APIs', category: 'Concepts', proficiency: 88, icon: 'Api' }
    ];
    for (const skill of skills) {
      await databaseService.createSkill(skill);
    }
    console.log('📝 Seeded skills.');
    
    // 4. Seed Projects
    const projects = [
      {
        title: 'Personal Portfolio Content Management System',
        description: 'Developed a dynamic portfolio CMS using React, Node.js, Express, and Firebase. Allows administrators to manage projects, skills, education, certifications, and achievements through an admin dashboard. Features secure authentication, file uploads, downloadable resumes, responsive UI, and Netlify deployment.',
        image: 'https://media.licdn.com/dms/image/v2/D4E12AQFG_bRKMWbgTg/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1739245056904?e=2147483647&v=beta&t=bDkeH2W5Nbj-grYTJKEYQo_d2YA3EEcctExhpDAWEas',
        github_url: 'https://github.com',
        demo_url: 'https://demo.com',
        tags: 'React.js, Node.js, Express.js, Firebase, JWT, CMS',
        category: 'Full Stack'
      },
      {
        title: 'Online Food Delivery System',
        description: 'Developed a responsive food ordering platform using React and Firebase. Includes restaurant browsing, menu management, shopping cart, secure authentication, and order tracking. Optimized for desktop and mobile devices.',
        image: 'https://thumbs.dreamstime.com/b/food-delivery-logo-design-template-134749604.jpg',
        github_url: 'https://github.com',
        demo_url: 'https://demo.com',
        tags: 'React.js, Firebase, Tailwind CSS, Responsive Web Design',
        category: 'Web Application'
      },
      {
        title: 'Jewellery ERP System UI/UX',
        description: 'Designed a complete Jewellery ERP dashboard in Figma. Includes Inventory, Sales, Purchase, Manufacturing, CRM, Accounting, Reports, HR, and User Management. Focused on luxury branding and enterprise usability.',
        image: '/assets/images/profile.png',
        github_url: 'https://github.com',
        demo_url: 'https://demo.com',
        tags: 'Figma, UI/UX Design, ERP, Jewellery, Wireframing, Prototyping',
        category: 'UI/UX Design'
      },
      {
        title: 'AI-based Accident Detection and Emergency Alert System',
        description: 'Developed an AI-powered road accident detection system using Python, OpenCV, Machine Learning, and Flask. Detects accidents in real time and automatically sends emergency alerts. Includes accident visualization, prediction, and reporting dashboard.',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsWYzCjJiaxS5LjL3DXbk6zOY4HAtZ7_jr6Y990UimBppZVqD1pj3ilpE&s=10',
        github_url: 'https://github.com',
        demo_url: 'https://demo.com',
        tags: 'Python, OpenCV, Machine Learning, Flask, AI, Computer Vision',
        category: 'AI / ML'
      }
    ];
    for (const project of projects) {
      await databaseService.createProject(project);
    }
    console.log('📝 Seeded projects.');

    // 5. Seed Experience
    const experiences = [
      {
        company: 'Grevya Technologies',
        role: 'AI & Full Stack Development Intern',
        location: 'Coimbatore, India',
        start_date: 'Feb 2026',
        end_date: 'June 2026',
        description: 'Developed modern web applications using React and Firebase. Worked on responsive UI development and CMS implementation. Collaborated using Git and GitHub. Participated in debugging, testing, and deployment. Improved application performance and user experience.',
        current: false
      },
      {
        company: 'AJ & VG Media Pvt Ltd',
        role: 'Software Development Intern',
        location: 'Coimbatore, India',
        start_date: 'May 2025',
        end_date: 'May 2025',
        description: 'Developed ERP & CRM Jewellery Management System. Built Inventory Module, Sales Module, Billing Module, and Customer Management. Implemented Gold Weight Tracking and SQL CRUD Operations.',
        current: false
      }
    ];
    for (const exp of experiences) {
      await databaseService.createExperience(exp);
    }
    console.log('📝 Seeded experiences.');

    // 6. Seed Education
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

    // 7. Seed Certificates
    const certificates = [
      { title: 'Java Programming', issuer: 'Oracle / Udemy', issue_date: '2024', verification_url: 'https://verification.com', credential_id: 'JV-2024' },
      { title: 'Python Programming', issuer: 'Coursera / Google', issue_date: '2024', verification_url: 'https://verification.com', credential_id: 'PY-2024' },
      { title: 'Web Development', issuer: 'Udemy', issue_date: '2024', verification_url: 'https://verification.com', credential_id: 'WD-2024' },
      { title: 'React Development', issuer: 'Coursera / Meta', issue_date: '2025', verification_url: 'https://verification.com', credential_id: 'RE-2025' },
      { title: 'SQL & Database Management', issuer: 'Udemy / SQL Workbench', issue_date: '2024', verification_url: 'https://verification.com', credential_id: 'SQL-2024' },
      { title: 'UI/UX Design using Figma', issuer: 'Figma Academy', issue_date: '2025', verification_url: 'https://verification.com', credential_id: 'UIUX-2025' },
      { title: 'Git & GitHub', issuer: 'Coursera', issue_date: '2024', verification_url: 'https://verification.com', credential_id: 'GIT-2024' },
      { title: 'Machine Learning Fundamentals', issuer: 'Stanford / Coursera', issue_date: '2025', verification_url: 'https://verification.com', credential_id: 'ML-2025' }
    ];
    for (const cert of certificates) {
      await databaseService.createCertificate(cert);
    }
    console.log('📝 Seeded certificates.');

    // 8. Seed Achievements
    const achievements = [
      { title: 'Built multiple full-stack web applications', organization: 'Self', date: '2025', description: 'Developed, optimized, and deployed full-stack web apps using modern frameworks.', type: 'Development' },
      { title: 'Developed a Personal Portfolio CMS with Admin Panel', organization: 'Self', date: '2025', description: 'Created a highly responsive CMS application enabling admin operations for portfolio management.', type: 'Project' },
      { title: 'Designed a complete Jewellery ERP UI/UX', organization: 'Client Project', date: '2025', description: 'Designed a comprehensive Jewellery ERP dashboard layout focusing on luxury branding.', type: 'Design' },
      { title: 'Participated in coding competitions and technical events', organization: 'College & Online Platforms', date: '2024', description: 'Engaged in coding hackathons and local/national technical fests.', type: 'Competition' },
      { title: 'Solved Data Structures and Algorithm problems', organization: 'LeetCode / Hackerrank', date: '2025', description: 'Practiced problem solving on multiple online platforms to build robust coding skills.', type: 'Coding' },
      { title: 'Continuously learning Full Stack Development and AI technologies', organization: 'Self-directed', date: '2026', description: 'Acquiring certifications and hands-on project exposure in advanced AI and full-stack paths.', type: 'Learning' }
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
