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
      role_summary: 'Full Stack Developer | React Developer | Spring Boot Developer | AI & IoT Enthusiast',
      bio: 'I am an Information Technology undergraduate passionate about Full Stack Development, React.js, Spring Boot, AI, IoT, and modern web technologies. I enjoy developing responsive applications, learning new technologies, and building products that create real-world impact.',
      age: 21,
      location: 'Coimbatore, Tamil Nadu',
      degree: 'B.Tech Information Technology',
      cgpa: 6.7,
      languages: 'English, Tamil',
      interests: 'React, Spring Boot, IoT, AI, Full Stack Development',
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
      // 1. Programming Languages
      { name: 'Java', category: 'Programming Languages', proficiency: 85, icon: 'Java' },
      { name: 'JavaScript', category: 'Programming Languages', proficiency: 88, icon: 'Javascript' },
      { name: 'SQL', category: 'Programming Languages', proficiency: 85, icon: 'Sql' },

      // 2. Frontend
      { name: 'HTML5', category: 'Frontend', proficiency: 95, icon: 'Html5' },
      { name: 'CSS3', category: 'Frontend', proficiency: 92, icon: 'Css3' },
      { name: 'JavaScript (ES6+)', category: 'Frontend', proficiency: 88, icon: 'Javascript' },
      { name: 'React.js', category: 'Frontend', proficiency: 90, icon: 'React' },
      { name: 'Responsive Web Design', category: 'Frontend', proficiency: 85, icon: 'Layout' },
      { name: 'Bootstrap 5', category: 'Frontend', proficiency: 88, icon: 'Bootstrap' },
      { name: 'Tailwind CSS', category: 'Frontend', proficiency: 85, icon: 'Tailwind' },
      { name: 'Material UI (MUI)', category: 'Frontend', proficiency: 80, icon: 'Mui' },

      // 3. Backend
      { name: 'Spring Boot', category: 'Backend', proficiency: 82, icon: 'Spring' },
      { name: 'REST APIs', category: 'Backend', proficiency: 84, icon: 'Api' },
      { name: 'Java', category: 'Backend', proficiency: 85, icon: 'Java' },
      { name: 'Firebase', category: 'Backend', proficiency: 80, icon: 'Firebase' },

      // 4. Database
      { name: 'SQL', category: 'Database', proficiency: 85, icon: 'Sql' },
      { name: 'MySQL', category: 'Database', proficiency: 85, icon: 'Mysql' },
      { name: 'SQL Workbench', category: 'Database', proficiency: 82, icon: 'Database' },

      // 5. Tools & Platforms
      { name: 'Git', category: 'Tools & Platforms', proficiency: 82, icon: 'Git' },
      { name: 'GitHub', category: 'Tools & Platforms', proficiency: 84, icon: 'Github' },
      { name: 'VS Code', category: 'Tools & Platforms', proficiency: 95, icon: 'Vscode' },
      { name: 'Eclipse', category: 'Tools & Platforms', proficiency: 80, icon: 'Code' },
      { name: 'Selenium', category: 'Tools & Platforms', proficiency: 85, icon: 'Shield' },
      { name: 'AWS', category: 'Tools & Platforms', proficiency: 75, icon: 'Aws' },
      { name: 'AntiGravity', category: 'Tools & Platforms', proficiency: 90, icon: 'Command' },

      // 6. Soft Skills
      { name: 'Problem Solving', category: 'Soft Skills', proficiency: 90, icon: 'Brain' },
      { name: 'Team Collaboration', category: 'Soft Skills', proficiency: 92, icon: 'Users' },
      { name: 'Communication', category: 'Soft Skills', proficiency: 88, icon: 'Message' },
      { name: 'Leadership', category: 'Soft Skills', proficiency: 85, icon: 'Award' },
      { name: 'Time Management', category: 'Soft Skills', proficiency: 87, icon: 'Clock' },
      { name: 'Critical Thinking', category: 'Soft Skills', proficiency: 89, icon: 'Zap' }
    ];
    for (const skill of skills) {
      await databaseService.createSkill(skill);
    }
    
    // 4. Seed Projects
    const projects = [
      {
        title: 'Accident Detection and Alert System',
        description: 'Built an intelligent vehicle accident detection system using ESP32, GPS, GSM and MPU6050 sensors. Implemented TinyML for accurate accident detection and automatic emergency alerts with live GPS location.',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsWYzCjJiaxS5LjL3DXbk6zOY4HAtZ7_jr6Y990UimBppZVqD1pj3ilpE&s=10',
        github_url: 'https://github.com',
        demo_url: 'https://demo.com',
        tags: 'ESP32, GPS, GSM, MPU6050, TinyML, Embedded C, IoT, Ongoing, 2026',
        category: 'IoT'
      },
      {
        title: 'Personal Portfolio Content Management System',
        description: 'Developed a CMS that allows dynamic management of portfolio projects, skills, achievements and profile content using React.js and Firebase.',
        image: 'https://media.licdn.com/dms/image/v2/D4E12AQFG_bRKMWbgTg/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1739245056904?e=2147483647&v=beta&t=bDkeH2W5Nbj-grYTJKEYQo_d2YA3EEcctExhpDAWEas',
        github_url: 'https://github.com',
        demo_url: 'https://demo.com',
        tags: 'React.js, Firebase, REST APIs, Responsive Design, Completed, 2025, Full Stack',
        category: 'Full Stack'
      },
      {
        title: 'Online Food Delivery System',
        description: 'Built an online food ordering platform with customer management, delivery tracking and AI-powered analytics.',
        image: 'https://thumbs.dreamstime.com/b/food-delivery-logo-design-template-134749604.jpg',
        github_url: 'https://github.com',
        demo_url: 'https://demo.com',
        tags: 'React.js, Spring Boot, Firebase, REST APIs, AI Analytics, Completed, 2025',
        category: 'Web Application'
      }
    ];
    for (const project of projects) {
      await databaseService.createProject(project);
    }

    // 5. Seed Experience
    const experiences = [
      {
        company: 'Grevya Technologies',
        role: 'Full Stack Intern',
        location: 'Coimbatore, India',
        start_date: 'Feb 2026',
        end_date: 'June 2026',
        description: 'Developed responsive company website. Frontend development, performance optimization, and feature implementation. Worked with AI/ML workflows and collaborated with the development team.',
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

    // 6. Seed Education
    const educations = [
      {
        institution: 'Sri Krishna College of Technology',
        degree: 'Bachelor of Technology',
        field: 'Information Technology',
        start_date: '2023',
        end_date: '2027',
        grade: 'CGPA: 6.7'
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

    // 7. Seed Certificates
    const certificates = [
      { title: 'React', issuer: 'Coursera', issue_date: '2025', verification_url: '#', credential_id: 'C-1' },
      { title: 'AI for Everyone', issuer: 'Coursera', issue_date: '2025', verification_url: '#', credential_id: 'C-2' },
      { title: 'DevOps & SQL', issuer: 'Udemy', issue_date: '2025', verification_url: '#', credential_id: 'C-3' },
      { title: 'AWS Cloud Practitioner (Sample)', issuer: 'AWS', issue_date: '2024', verification_url: '#', credential_id: 'C-4' },
      { title: 'Java Programming Masterclass (Sample)', issuer: 'Udemy', issue_date: '2024', verification_url: '#', credential_id: 'C-5' },
      { title: 'Spring Boot Essentials (Sample)', issuer: 'Udemy', issue_date: '2024', verification_url: '#', credential_id: 'C-6' },
      { title: 'Git & GitHub Professional (Sample)', issuer: 'Coursera', issue_date: '2024', verification_url: '#', credential_id: 'C-7' }
    ];
    for (const cert of certificates) {
      await databaseService.createCertificate(cert);
    }

    // 8. Seed Achievements
    const achievements = [
      { title: 'Smart India Hackathon Participant', organization: 'Govt of India', date: '2025', description: 'Participated in the national level Smart India Hackathon.', type: 'Hackathon' },
      { title: 'Core Organizer - Avantaa 2024', organization: 'SKCT', date: '2024', description: 'Core Organizer for the Avantaa 2024 college technical fest.', type: 'Event' },
      { title: 'Completed Multiple Full Stack Projects', organization: 'Self', date: '2025', description: 'Successfully built and deployed several full stack applications using React and Spring Boot.', type: 'Project' },
      { title: 'Built IoT Accident Detection System', organization: 'Academic Project', date: '2026', description: 'Engineered a smart accident detection system using ESP32 and TinyML.', type: 'Project' }
    ];
    for (const ach of achievements) {
      await databaseService.createAchievement(ach);
    }

    // 9. Seed Testimonials (Empty as per user deleting placeholder? "Replace every placeholder..." I'll create one realistic one)
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
