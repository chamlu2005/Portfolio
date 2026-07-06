-- Schema definition for Portfolio CMS

-- Users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profile details
CREATE TABLE IF NOT EXISTS profile (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) DEFAULT 'Daniel Paul',
  role_summary VARCHAR(255) DEFAULT 'Full Stack Developer',
  bio TEXT,
  age INT DEFAULT 22,
  location VARCHAR(255) DEFAULT 'Coimbatore, India',
  degree VARCHAR(255) DEFAULT 'B.Tech Information Technology',
  cgpa REAL DEFAULT 7.2,
  languages VARCHAR(255) DEFAULT 'English, Tamil',
  interests VARCHAR(255) DEFAULT 'Artificial Intelligence, Web Development, UI/UX, Cloud Computing',
  resume_url VARCHAR(255),
  avatar_url VARCHAR(255),
  github VARCHAR(255),
  linkedin VARCHAR(255),
  instagram VARCHAR(255),
  email VARCHAR(255)
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image VARCHAR(255),
  github_url VARCHAR(255),
  demo_url VARCHAR(255),
  tags VARCHAR(255),
  category VARCHAR(100),
  views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills
CREATE TABLE IF NOT EXISTS skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  proficiency INT DEFAULT 80,
  icon VARCHAR(100)
);

-- Career History
CREATE TABLE IF NOT EXISTS experience (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  start_date VARCHAR(100),
  end_date VARCHAR(100),
  description TEXT,
  current BOOLEAN DEFAULT 0
);

-- Education History
CREATE TABLE IF NOT EXISTS education (
  id INT AUTO_INCREMENT PRIMARY KEY,
  institution VARCHAR(255) NOT NULL,
  degree VARCHAR(255) NOT NULL,
  field VARCHAR(255),
  start_date VARCHAR(100),
  end_date VARCHAR(100),
  grade VARCHAR(50)
);

-- Credentials
CREATE TABLE IF NOT EXISTS certificates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  issuer VARCHAR(255) NOT NULL,
  issue_date VARCHAR(100),
  verification_url VARCHAR(255),
  credential_id VARCHAR(255)
);

-- Achievements Log
CREATE TABLE IF NOT EXISTS achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  organization VARCHAR(255),
  date VARCHAR(100),
  description TEXT,
  type VARCHAR(100)
);

-- Client Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_name VARCHAR(255) NOT NULL,
  position VARCHAR(255),
  company VARCHAR(255),
  feedback TEXT,
  rating INT DEFAULT 5,
  image VARCHAR(255)
);

-- Blog Articles
CREATE TABLE IF NOT EXISTS blogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  summary TEXT,
  content LONGTEXT,
  image VARCHAR(255),
  tags VARCHAR(255),
  views INT DEFAULT 0,
  read_time VARCHAR(50),
  published BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recruiter Contact & Schedule
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recruiter_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  subject VARCHAR(255),
  message TEXT,
  rating INT DEFAULT 0,
  interview_request BOOLEAN DEFAULT 0,
  interview_date VARCHAR(100),
  bookmarked BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Visitor Logs Tracing
CREATE TABLE IF NOT EXISTS visitor_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  ip VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Unknown',
  device VARCHAR(100),
  os VARCHAR(100),
  browser VARCHAR(100),
  traffic_source VARCHAR(100) DEFAULT 'Direct',
  referrer VARCHAR(255),
  session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  duration INT DEFAULT 0,
  scroll_depth INT DEFAULT 0,
  bounce_rate REAL DEFAULT 0
);

-- Detailed behavioral clicks
CREATE TABLE IF NOT EXISTS analytics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  metric_name VARCHAR(255) NOT NULL,
  metric_value VARCHAR(255),
  target_id VARCHAR(255),
  extra_info VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI recommendations
CREATE TABLE IF NOT EXISTS ai_suggestions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(100) NOT NULL,
  score INT DEFAULT 0,
  recommendations TEXT,
  strengths TEXT,
  weaknesses TEXT,
  action_items TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Application configurations
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key_name VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Push Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message TEXT NOT NULL,
  type VARCHAR(100) DEFAULT 'info',
  is_read BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
