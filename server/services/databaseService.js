import dbManager, { DB_TYPES } from '../config/db.js';
import fs from 'fs/promises';

// Helper for SQLite Promisified commands
const sqliteRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    // Convert MySQL-style "?" placeholders if they map to SQLite directly
    dbManager.sqliteDb.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ insertId: this.lastID, affectedRows: this.changes });
    });
  });
};

const sqliteAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    dbManager.sqliteDb.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const sqliteGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    dbManager.sqliteDb.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

class DatabaseService {
  constructor() {
    this.writeQueue = Promise.resolve();
  }

  // Run SQL tables setup (for MySQL/SQLite)
  async runMigrations() {
    const type = dbManager.getType();
    if (type === DB_TYPES.JSON) {
      console.log('📦 JSON Database Mode Active. Skipping SQL migrations.');
      return;
    }

    const isSQLite = type === DB_TYPES.SQLITE;
    const autoIncrement = isSQLite ? 'AUTOINCREMENT' : 'AUTO_INCREMENT';
    const primaryKey = `INTEGER PRIMARY KEY ${autoIncrement}`;
    const textType = isSQLite ? 'TEXT' : 'LONGTEXT';

    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        id ${isSQLite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY'},
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(100),
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'visitor',
        country VARCHAR(100),
        profession VARCHAR(255),
        company VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS profile (
        id ${isSQLite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY'},
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
      )`,
      `CREATE TABLE IF NOT EXISTS projects (
        id ${isSQLite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY'},
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        github_url VARCHAR(255),
        demo_url VARCHAR(255),
        tags VARCHAR(255),
        category VARCHAR(100),
        views INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS skills (
        id ${isSQLite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY'},
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        proficiency INT DEFAULT 80,
        icon VARCHAR(100)
      )`,
      `CREATE TABLE IF NOT EXISTS experience (
        id ${isSQLite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY'},
        company VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        start_date VARCHAR(100),
        end_date VARCHAR(100),
        description TEXT,
        current BOOLEAN DEFAULT 0
      )`,
      `CREATE TABLE IF NOT EXISTS education (
        id ${isSQLite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY'},
        institution VARCHAR(255) NOT NULL,
        degree VARCHAR(255) NOT NULL,
        field VARCHAR(255),
        start_date VARCHAR(100),
        end_date VARCHAR(100),
        grade VARCHAR(50)
      )`,
      `CREATE TABLE IF NOT EXISTS certificates (
        id ${isSQLite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY'},
        title VARCHAR(255) NOT NULL,
        issuer VARCHAR(255) NOT NULL,
        issue_date VARCHAR(100),
        verification_url VARCHAR(255),
        credential_id VARCHAR(255)
      )`,
      `CREATE TABLE IF NOT EXISTS achievements (
        id ${isSQLite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY'},
        title VARCHAR(255) NOT NULL,
        organization VARCHAR(255),
        date VARCHAR(100),
        description TEXT,
        type VARCHAR(100)
      )`,
      `CREATE TABLE IF NOT EXISTS testimonials (
        id ${isSQLite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY'},
        client_name VARCHAR(255) NOT NULL,
        position VARCHAR(255),
        company VARCHAR(255),
        feedback TEXT,
        rating INT DEFAULT 5,
        image VARCHAR(255)
      )`,
      `CREATE TABLE IF NOT EXISTS blogs (
        id ${isSQLite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY'},
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        summary TEXT,
        content ${textType},
        image VARCHAR(255),
        tags VARCHAR(255),
        views INT DEFAULT 0,
        read_time VARCHAR(50),
        published BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS messages (
        id ${isSQLite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY'},
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
      )`,
      `CREATE TABLE IF NOT EXISTS visitors (
        id ${isSQLite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY'},
        user_id INT,
        name VARCHAR(255) DEFAULT 'Guest',
        email VARCHAR(255),
        phone VARCHAR(100),
        country VARCHAR(100) DEFAULT 'Unknown',
        company VARCHAR(255),
        login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        logout_time TIMESTAMP NULL,
        ip_address VARCHAR(100),
        browser VARCHAR(150),
        os VARCHAR(100),
        device_type VARCHAR(100),
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS visitor_logs (
        id ${isSQLite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY'},
        visitor_id INT,
        action VARCHAR(255) NOT NULL,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS resume_downloads (
        id ${isSQLite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY'},
        visitor_name VARCHAR(255),
        email VARCHAR(255),
        download_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        device VARCHAR(100),
        browser VARCHAR(100),
        os VARCHAR(100),
        country VARCHAR(100),
        ip_address VARCHAR(100)
      )`,
      `CREATE TABLE IF NOT EXISTS analytics (
        id ${isSQLite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY'},
        metric_name VARCHAR(255) NOT NULL,
        metric_value VARCHAR(255),
        target_id VARCHAR(255),
        extra_info VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS ai_suggestions (
        id ${isSQLite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY'},
        type VARCHAR(100) NOT NULL,
        score INT DEFAULT 0,
        recommendations TEXT,
        strengths TEXT,
        weaknesses TEXT,
        action_items TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS settings (
        id ${isSQLite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY'},
        key_name VARCHAR(255) UNIQUE NOT NULL,
        value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS notifications (
        id ${isSQLite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY'},
        message TEXT NOT NULL,
        type VARCHAR(100) DEFAULT 'info',
        is_read BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const q of queries) {
      if (type === DB_TYPES.MYSQL) {
        await dbManager.mysqlPool.query(q);
      } else if (type === DB_TYPES.SQLITE) {
        await sqliteRun(q);
      }
    }
    console.log('✅ SQL migrations completed successfully!');
  }

  // --- SQL EXECUTOR HELPERS ---
  async execute(sql, params = []) {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL) {
      const [res] = await dbManager.mysqlPool.query(sql, params);
      return res;
    } else if (type === DB_TYPES.SQLITE) {
      return await sqliteRun(sql, params);
    } else {
      throw new Error('Raw SQL execution not supported in JSON Mode.');
    }
  }

  async query(sql, params = []) {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL) {
      const [rows] = await dbManager.mysqlPool.query(sql, params);
      return rows;
    } else if (type === DB_TYPES.SQLITE) {
      return await sqliteAll(sql, params);
    } else {
      throw new Error('Raw SQL query not supported in JSON Mode.');
    }
  }

  // --- JSON LOCAL FILE STORAGE HELPERS ---
  async readJson() {
    const data = await fs.readFile(dbManager.jsonStore, 'utf8');
    return JSON.parse(data);
  }

  async writeJson(data) {
    // Prevent overlapping file writes using a micro-queue
    this.writeQueue = this.writeQueue.then(async () => {
      await fs.writeFile(dbManager.jsonStore, JSON.stringify(data, null, 2));
    });
    return this.writeQueue;
  }

  // --- REPOSITORY INTERFACE METHODS ---

  // Auth Operations
  async getUserByEmail(email) {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL) {
      const [rows] = await dbManager.mysqlPool.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0] || null;
    } else if (type === DB_TYPES.SQLITE) {
      return await sqliteGet('SELECT * FROM users WHERE email = ?', [email]);
    } else {
      const db = await this.readJson();
      return db.users.find(u => u.email === email) || null;
    }
  }

  async createUser(email, passwordHash, role = 'admin') {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL) {
      const [res] = await dbManager.mysqlPool.query(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        [email, passwordHash, role]
      );
      return res.insertId;
    } else if (type === DB_TYPES.SQLITE) {
      const res = await sqliteRun(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        [email, passwordHash, role]
      );
      return res.insertId;
    } else {
      const db = await this.readJson();
      const newUser = { id: db.users.length + 1, email, password: passwordHash, role, created_at: new Date().toISOString() };
      db.users.push(newUser);
      await this.writeJson(db);
      return newUser.id;
    }
  }

  async getUserById(id) {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL) {
      const [rows] = await dbManager.mysqlPool.query('SELECT id, email, role, created_at FROM users WHERE id = ?', [id]);
      return rows[0] || null;
    } else if (type === DB_TYPES.SQLITE) {
      return await sqliteGet('SELECT id, email, role, created_at FROM users WHERE id = ?', [id]);
    } else {
      const db = await this.readJson();
      const u = db.users.find(x => x.id === parseInt(id));
      if (!u) return null;
      return { id: u.id, email: u.email, role: u.role, created_at: u.created_at };
    }
  }

  // Profile Operations
  async getProfile() {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL) {
      const [rows] = await dbManager.mysqlPool.query('SELECT * FROM profile LIMIT 1');
      return rows[0] || null;
    } else if (type === DB_TYPES.SQLITE) {
      return await sqliteGet('SELECT * FROM profile LIMIT 1');
    } else {
      const db = await this.readJson();
      return db.profile || null;
    }
  }

  async updateProfile(data) {
    const type = dbManager.getType();
    const keys = ['name', 'role_summary', 'bio', 'age', 'location', 'degree', 'cgpa', 'languages', 'interests', 'resume_url', 'avatar_url', 'github', 'linkedin', 'instagram', 'email'];
    
    // Create base data object
    const fields = {};
    keys.forEach(k => {
      if (data[k] !== undefined) fields[k] = data[k];
    });

    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      const current = await this.getProfile();
      if (!current) {
        // Insert
        const colNames = Object.keys(fields).join(', ');
        const placeholders = Object.keys(fields).map(() => '?').join(', ');
        const vals = Object.values(fields);
        await this.execute(`INSERT INTO profile (${colNames}) VALUES (${placeholders})`, vals);
      } else {
        // Update
        const sets = Object.keys(fields).map(k => `${k} = ?`).join(', ');
        const vals = Object.values(fields);
        await this.execute(`UPDATE profile SET ${sets} WHERE id = ?`, [...vals, current.id]);
      }
      return await this.getProfile();
    } else {
      const db = await this.readJson();
      db.profile = { ...db.profile, ...fields };
      await this.writeJson(db);
      return db.profile;
    }
  }

  // Projects Operations
  async getProjects() {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      return await this.query('SELECT * FROM projects ORDER BY created_at DESC');
    } else {
      const db = await this.readJson();
      return [...db.projects].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  }

  async createProject(data) {
    const type = dbManager.getType();
    const { title, description, image, github_url, demo_url, tags, category } = data;
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      const res = await this.execute(
        'INSERT INTO projects (title, description, image, github_url, demo_url, tags, category, views) VALUES (?, ?, ?, ?, ?, ?, ?, 0)',
        [title, description, image, github_url, demo_url, tags, category]
      );
      return { id: res.insertId, ...data, views: 0 };
    } else {
      const db = await this.readJson();
      const newProj = {
        id: db.projects.length > 0 ? Math.max(...db.projects.map(p => p.id)) + 1 : 1,
        title, description, image, github_url, demo_url, tags, category, views: 0,
        created_at: new Date().toISOString()
      };
      db.projects.push(newProj);
      await this.writeJson(db);
      return newProj;
    }
  }

  async updateProject(id, data) {
    const type = dbManager.getType();
    const { title, description, image, github_url, demo_url, tags, category } = data;
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      await this.execute(
        'UPDATE projects SET title = ?, description = ?, image = ?, github_url = ?, demo_url = ?, tags = ?, category = ? WHERE id = ?',
        [title, description, image, github_url, demo_url, tags, category, id]
      );
      return { id, ...data };
    } else {
      const db = await this.readJson();
      const idx = db.projects.findIndex(p => p.id === parseInt(id));
      if (idx !== -1) {
        db.projects[idx] = { ...db.projects[idx], title, description, image, github_url, demo_url, tags, category };
        await this.writeJson(db);
        return db.projects[idx];
      }
      return null;
    }
  }

  async deleteProject(id) {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      await this.execute('DELETE FROM projects WHERE id = ?', [id]);
      return true;
    } else {
      const db = await this.readJson();
      db.projects = db.projects.filter(p => p.id !== parseInt(id));
      await this.writeJson(db);
      return true;
    }
  }

  async incrementProjectViews(id) {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      await this.execute('UPDATE projects SET views = views + 1 WHERE id = ?', [id]);
    } else {
      const db = await this.readJson();
      const p = db.projects.find(x => x.id === parseInt(id));
      if (p) {
        p.views = (p.views || 0) + 1;
        await this.writeJson(db);
      }
    }
  }

  // Skills Operations
  async getSkills() {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      return await this.query('SELECT * FROM skills');
    } else {
      const db = await this.readJson();
      return db.skills;
    }
  }

  async createSkill(data) {
    const type = dbManager.getType();
    const { name, category, proficiency, icon } = data;
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      const res = await this.execute(
        'INSERT INTO skills (name, category, proficiency, icon) VALUES (?, ?, ?, ?)',
        [name, category, proficiency, icon]
      );
      return { id: res.insertId, ...data };
    } else {
      const db = await this.readJson();
      const newSkill = {
        id: db.skills.length > 0 ? Math.max(...db.skills.map(s => s.id)) + 1 : 1,
        name, category, proficiency: parseInt(proficiency), icon
      };
      db.skills.push(newSkill);
      await this.writeJson(db);
      return newSkill;
    }
  }

  async updateSkill(id, data) {
    const type = dbManager.getType();
    const { name, category, proficiency, icon } = data;
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      await this.execute(
        'UPDATE skills SET name = ?, category = ?, proficiency = ?, icon = ? WHERE id = ?',
        [name, category, proficiency, icon, id]
      );
      return { id, ...data };
    } else {
      const db = await this.readJson();
      const idx = db.skills.findIndex(s => s.id === parseInt(id));
      if (idx !== -1) {
        db.skills[idx] = { ...db.skills[idx], name, category, proficiency: parseInt(proficiency), icon };
        await this.writeJson(db);
        return db.skills[idx];
      }
      return null;
    }
  }

  async deleteSkill(id) {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      await this.execute('DELETE FROM skills WHERE id = ?', [id]);
      return true;
    } else {
      const db = await this.readJson();
      db.skills = db.skills.filter(s => s.id !== parseInt(id));
      await this.writeJson(db);
      return true;
    }
  }

  // Experience Operations
  async getExperiences() {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      return await this.query('SELECT * FROM experience ORDER BY start_date DESC');
    } else {
      const db = await this.readJson();
      return db.experience;
    }
  }

  async createExperience(data) {
    const type = dbManager.getType();
    const { company, role, location, start_date, end_date, description, current } = data;
    const curVal = current ? 1 : 0;
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      const res = await this.execute(
        'INSERT INTO experience (company, role, location, start_date, end_date, description, current) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [company, role, location, start_date, end_date, description, curVal]
      );
      return { id: res.insertId, ...data };
    } else {
      const db = await this.readJson();
      const newExp = {
        id: db.experience.length > 0 ? Math.max(...db.experience.map(e => e.id)) + 1 : 1,
        company, role, location, start_date, end_date, description, current: !!current
      };
      db.experience.push(newExp);
      await this.writeJson(db);
      return newExp;
    }
  }

  async updateExperience(id, data) {
    const type = dbManager.getType();
    const { company, role, location, start_date, end_date, description, current } = data;
    const curVal = current ? 1 : 0;
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      await this.execute(
        'UPDATE experience SET company = ?, role = ?, location = ?, start_date = ?, end_date = ?, description = ?, current = ? WHERE id = ?',
        [company, role, location, start_date, end_date, description, curVal, id]
      );
      return { id, ...data };
    } else {
      const db = await this.readJson();
      const idx = db.experience.findIndex(e => e.id === parseInt(id));
      if (idx !== -1) {
        db.experience[idx] = { ...db.experience[idx], company, role, location, start_date, end_date, description, current: !!current };
        await this.writeJson(db);
        return db.experience[idx];
      }
      return null;
    }
  }

  async deleteExperience(id) {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      await this.execute('DELETE FROM experience WHERE id = ?', [id]);
      return true;
    } else {
      const db = await this.readJson();
      db.experience = db.experience.filter(e => e.id !== parseInt(id));
      await this.writeJson(db);
      return true;
    }
  }

  // Education Operations
  async getEducation() {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      return await this.query('SELECT * FROM education ORDER BY start_date DESC');
    } else {
      const db = await this.readJson();
      return db.education;
    }
  }

  async createEducation(data) {
    const type = dbManager.getType();
    const { institution, degree, field, start_date, end_date, grade } = data;
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      const res = await this.execute(
        'INSERT INTO education (institution, degree, field, start_date, end_date, grade) VALUES (?, ?, ?, ?, ?, ?)',
        [institution, degree, field, start_date, end_date, grade]
      );
      return { id: res.insertId, ...data };
    } else {
      const db = await this.readJson();
      const newEdu = {
        id: db.education.length > 0 ? Math.max(...db.education.map(e => e.id)) + 1 : 1,
        institution, degree, field, start_date, end_date, grade
      };
      db.education.push(newEdu);
      await this.writeJson(db);
      return newEdu;
    }
  }

  async updateEducation(id, data) {
    const type = dbManager.getType();
    const { institution, degree, field, start_date, end_date, grade } = data;
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      await this.execute(
        'UPDATE education SET institution = ?, degree = ?, field = ?, start_date = ?, end_date = ?, grade = ? WHERE id = ?',
        [institution, degree, field, start_date, end_date, grade, id]
      );
      return { id, ...data };
    } else {
      const db = await this.readJson();
      const idx = db.education.findIndex(e => e.id === parseInt(id));
      if (idx !== -1) {
        db.education[idx] = { ...db.education[idx], institution, degree, field, start_date, end_date, grade };
        await this.writeJson(db);
        return db.education[idx];
      }
      return null;
    }
  }

  async deleteEducation(id) {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      await this.execute('DELETE FROM education WHERE id = ?', [id]);
      return true;
    } else {
      const db = await this.readJson();
      db.education = db.education.filter(e => e.id !== parseInt(id));
      await this.writeJson(db);
      return true;
    }
  }

  // Certificates Operations
  async getCertificates() {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      return await this.query('SELECT * FROM certificates');
    } else {
      const db = await this.readJson();
      return db.certificates;
    }
  }

  async createCertificate(data) {
    const type = dbManager.getType();
    const { title, issuer, issue_date, verification_url, credential_id } = data;
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      const res = await this.execute(
        'INSERT INTO certificates (title, issuer, issue_date, verification_url, credential_id) VALUES (?, ?, ?, ?, ?)',
        [title, issuer, issue_date, verification_url, credential_id]
      );
      return { id: res.insertId, ...data };
    } else {
      const db = await this.readJson();
      const newCert = {
        id: db.certificates.length > 0 ? Math.max(...db.certificates.map(c => c.id)) + 1 : 1,
        title, issuer, issue_date, verification_url, credential_id
      };
      db.certificates.push(newCert);
      await this.writeJson(db);
      return newCert;
    }
  }

  async updateCertificate(id, data) {
    const type = dbManager.getType();
    const { title, issuer, issue_date, verification_url, credential_id } = data;
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      await this.execute(
        'UPDATE certificates SET title = ?, issuer = ?, issue_date = ?, verification_url = ?, credential_id = ? WHERE id = ?',
        [title, issuer, issue_date, verification_url, credential_id, id]
      );
      return { id, ...data };
    } else {
      const db = await this.readJson();
      const idx = db.certificates.findIndex(c => c.id === parseInt(id));
      if (idx !== -1) {
        db.certificates[idx] = { ...db.certificates[idx], title, issuer, issue_date, verification_url, credential_id };
        await this.writeJson(db);
        return db.certificates[idx];
      }
      return null;
    }
  }

  async deleteCertificate(id) {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      await this.execute('DELETE FROM certificates WHERE id = ?', [id]);
      return true;
    } else {
      const db = await this.readJson();
      db.certificates = db.certificates.filter(c => c.id !== parseInt(id));
      await this.writeJson(db);
      return true;
    }
  }

  // Achievements Operations
  async getAchievements() {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      return await this.query('SELECT * FROM achievements');
    } else {
      const db = await this.readJson();
      return db.achievements;
    }
  }

  async createAchievement(data) {
    const type = dbManager.getType();
    const { title, organization, date, description, type: achType } = data;
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      const res = await this.execute(
        'INSERT INTO achievements (title, organization, date, description, type) VALUES (?, ?, ?, ?, ?)',
        [title, organization, date, description, achType]
      );
      return { id: res.insertId, ...data };
    } else {
      const db = await this.readJson();
      const newAch = {
        id: db.achievements.length > 0 ? Math.max(...db.achievements.map(a => a.id)) + 1 : 1,
        title, organization, date, description, type: achType
      };
      db.achievements.push(newAch);
      await this.writeJson(db);
      return newAch;
    }
  }

  async updateAchievement(id, data) {
    const type = dbManager.getType();
    const { title, organization, date, description, type: achType } = data;
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      await this.execute(
        'UPDATE achievements SET title = ?, organization = ?, date = ?, description = ?, type = ? WHERE id = ?',
        [title, organization, date, description, achType, id]
      );
      return { id, ...data };
    } else {
      const db = await this.readJson();
      const idx = db.achievements.findIndex(a => a.id === parseInt(id));
      if (idx !== -1) {
        db.achievements[idx] = { ...db.achievements[idx], title, organization, date, description, type: achType };
        await this.writeJson(db);
        return db.achievements[idx];
      }
      return null;
    }
  }

  async deleteAchievement(id) {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      await this.execute('DELETE FROM achievements WHERE id = ?', [id]);
      return true;
    } else {
      const db = await this.readJson();
      db.achievements = db.achievements.filter(a => a.id !== parseInt(id));
      await this.writeJson(db);
      return true;
    }
  }

  // Testimonials Operations
  async getTestimonials() {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      return await this.query('SELECT * FROM testimonials');
    } else {
      const db = await this.readJson();
      return db.testimonials;
    }
  }

  async createTestimonial(data) {
    const type = dbManager.getType();
    const { client_name, position, company, feedback, rating, image } = data;
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      const res = await this.execute(
        'INSERT INTO testimonials (client_name, position, company, feedback, rating, image) VALUES (?, ?, ?, ?, ?, ?)',
        [client_name, position, company, feedback, rating, image]
      );
      return { id: res.insertId, ...data };
    } else {
      const db = await this.readJson();
      const newTest = {
        id: db.testimonials.length > 0 ? Math.max(...db.testimonials.map(t => t.id)) + 1 : 1,
        client_name, position, company, feedback, rating: parseInt(rating), image
      };
      db.testimonials.push(newTest);
      await this.writeJson(db);
      return newTest;
    }
  }

  async updateTestimonial(id, data) {
    const type = dbManager.getType();
    const { client_name, position, company, feedback, rating, image } = data;
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      await this.execute(
        'UPDATE testimonials SET client_name = ?, position = ?, company = ?, feedback = ?, rating = ?, image = ? WHERE id = ?',
        [client_name, position, company, feedback, rating, image, id]
      );
      return { id, ...data };
    } else {
      const db = await this.readJson();
      const idx = db.testimonials.findIndex(t => t.id === parseInt(id));
      if (idx !== -1) {
        db.testimonials[idx] = { ...db.testimonials[idx], client_name, position, company, feedback, rating: parseInt(rating), image };
        await this.writeJson(db);
        return db.testimonials[idx];
      }
      return null;
    }
  }

  async deleteTestimonial(id) {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      await this.execute('DELETE FROM testimonials WHERE id = ?', [id]);
      return true;
    } else {
      const db = await this.readJson();
      db.testimonials = db.testimonials.filter(t => t.id !== parseInt(id));
      await this.writeJson(db);
      return true;
    }
  }

  // Blogs Operations
  async getBlogs() {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      return await this.query('SELECT * FROM blogs ORDER BY created_at DESC');
    } else {
      const db = await this.readJson();
      return [...db.blogs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  }

  async createBlog(data) {
    const type = dbManager.getType();
    const { title, slug, summary, content, image, tags, read_time, published } = data;
    const pubVal = published ? 1 : 0;
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      const res = await this.execute(
        'INSERT INTO blogs (title, slug, summary, content, image, tags, views, read_time, published) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)',
        [title, slug, summary, content, image, tags, read_time, pubVal]
      );
      return { id: res.insertId, ...data, views: 0 };
    } else {
      const db = await this.readJson();
      const newBlog = {
        id: db.blogs.length > 0 ? Math.max(...db.blogs.map(b => b.id)) + 1 : 1,
        title, slug, summary, content, image, tags, views: 0, read_time, published: !!published,
        created_at: new Date().toISOString()
      };
      db.blogs.push(newBlog);
      await this.writeJson(db);
      return newBlog;
    }
  }

  async updateBlog(id, data) {
    const type = dbManager.getType();
    const { title, slug, summary, content, image, tags, read_time, published } = data;
    const pubVal = published ? 1 : 0;
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      await this.execute(
        'UPDATE blogs SET title = ?, slug = ?, summary = ?, content = ?, image = ?, tags = ?, read_time = ?, published = ? WHERE id = ?',
        [title, slug, summary, content, image, tags, read_time, pubVal, id]
      );
      return { id, ...data };
    } else {
      const db = await this.readJson();
      const idx = db.blogs.findIndex(b => b.id === parseInt(id));
      if (idx !== -1) {
        db.blogs[idx] = { ...db.blogs[idx], title, slug, summary, content, image, tags, read_time, published: !!published };
        await this.writeJson(db);
        return db.blogs[idx];
      }
      return null;
    }
  }

  async deleteBlog(id) {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      await this.execute('DELETE FROM blogs WHERE id = ?', [id]);
      return true;
    } else {
      const db = await this.readJson();
      db.blogs = db.blogs.filter(b => b.id !== parseInt(id));
      await this.writeJson(db);
      return true;
    }
  }

  async incrementBlogViews(id) {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      await this.execute('UPDATE blogs SET views = views + 1 WHERE id = ?', [id]);
    } else {
      const db = await this.readJson();
      const b = db.blogs.find(x => x.id === parseInt(id));
      if (b) {
        b.views = (b.views || 0) + 1;
        await this.writeJson(db);
      }
    }
  }

  // Recruiter Contact Messages Operations
  async getMessages() {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      return await this.query('SELECT * FROM messages ORDER BY created_at DESC');
    } else {
      const db = await this.readJson();
      return [...db.messages].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  }

  async createMessage(data) {
    const type = dbManager.getType();
    const { recruiter_name, email, company, subject, message, rating, interview_request, interview_date } = data;
    const reqVal = interview_request ? 1 : 0;
    const ratingVal = rating ? parseInt(rating) : 0;
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      const res = await this.execute(
        'INSERT INTO messages (recruiter_name, email, company, subject, message, rating, interview_request, interview_date, bookmarked) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)',
        [recruiter_name, email, company, subject, message, ratingVal, reqVal, interview_date || '']
      );
      return { id: res.insertId, ...data, bookmarked: 0 };
    } else {
      const db = await this.readJson();
      const newMsg = {
        id: db.messages.length > 0 ? Math.max(...db.messages.map(m => m.id)) + 1 : 1,
        recruiter_name, email, company, subject, message, rating: ratingVal,
        interview_request: !!interview_request, interview_date: interview_date || '', bookmarked: false,
        created_at: new Date().toISOString()
      };
      db.messages.push(newMsg);
      await this.writeJson(db);
      return newMsg;
    }
  }

  async updateMessageBookmark(id, status) {
    const type = dbManager.getType();
    const val = status ? 1 : 0;
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      await this.execute('UPDATE messages SET bookmarked = ? WHERE id = ?', [val, id]);
      return true;
    } else {
      const db = await this.readJson();
      const m = db.messages.find(x => x.id === parseInt(id));
      if (m) {
        m.bookmarked = !!status;
        await this.writeJson(db);
      }
      return true;
    }
  }

  async updateMessageRating(id, rating) {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      await this.execute('UPDATE messages SET rating = ? WHERE id = ?', [rating, id]);
      return true;
    } else {
      const db = await this.readJson();
      const m = db.messages.find(x => x.id === parseInt(id));
      if (m) {
        m.rating = parseInt(rating);
        await this.writeJson(db);
      }
      return true;
    }
  }

  async deleteMessage(id) {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      await this.execute('DELETE FROM messages WHERE id = ?', [id]);
      return true;
    } else {
      const db = await this.readJson();
      db.messages = db.messages.filter(m => m.id !== parseInt(id));
      await this.writeJson(db);
      return true;
    }
  }

  // Visitor Logs & Analytics
  async createVisitorLog(data) {
    const type = dbManager.getType();
    const { session_id, ip, country, device, os, browser, traffic_source, referrer, duration, scroll_depth, bounce_rate } = data;
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      await this.execute(
        'INSERT INTO visitor_logs (session_id, ip, country, device, os, browser, traffic_source, referrer, duration, scroll_depth, bounce_rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [session_id, ip, country || 'Unknown', device, os, browser, traffic_source || 'Direct', referrer || '', duration || 0, scroll_depth || 0, bounce_rate || 0]
      );
    } else {
      const db = await this.readJson();
      const newLog = {
        id: db.visitor_logs.length + 1,
        session_id, ip, country: country || 'Unknown', device, os, browser,
        traffic_source: traffic_source || 'Direct', referrer: referrer || '',
        session_start: new Date().toISOString(), duration: duration || 0,
        scroll_depth: scroll_depth || 0, bounce_rate: bounce_rate || 0
      };
      db.visitor_logs.push(newLog);
      await this.writeJson(db);
    }
  }

  async getVisitorLogs() {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      return await this.query('SELECT * FROM visitor_logs ORDER BY session_start DESC');
    } else {
      const db = await this.readJson();
      return [...db.visitor_logs].sort((a, b) => new Date(b.session_start) - new Date(a.session_start));
    }
  }

  // Generic custom analytic tracking (resume downloads, project/skill clicks)
  async logEvent(metric_name, metric_value, target_id = '', extra_info = '') {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      await this.execute(
        'INSERT INTO analytics (metric_name, metric_value, target_id, extra_info) VALUES (?, ?, ?, ?)',
        [metric_name, metric_value, target_id, extra_info]
      );
    } else {
      const db = await this.readJson();
      const newMetric = {
        id: db.analytics.length + 1,
        metric_name, metric_value, target_id, extra_info,
        created_at: new Date().toISOString()
      };
      db.analytics.push(newMetric);
      await this.writeJson(db);
    }
  }

  async getAnalyticsEvents() {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      return await this.query('SELECT * FROM analytics ORDER BY created_at DESC');
    } else {
      const db = await this.readJson();
      return [...db.analytics].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  }

  // AI suggestions Cache
  async getAISuggestions() {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      return await this.query('SELECT * FROM ai_suggestions ORDER BY created_at DESC');
    } else {
      const db = await this.readJson();
      return [...db.ai_suggestions].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  }

  async createAISuggestion(data) {
    const type = dbManager.getType();
    const { suggestionType, score, recommendations, strengths, weaknesses, action_items } = data;
    const recsStr = JSON.stringify(recommendations);
    const strStr = JSON.stringify(strengths);
    const weakStr = JSON.stringify(weaknesses);
    const actStr = JSON.stringify(action_items);
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      const res = await this.execute(
        'INSERT INTO ai_suggestions (type, score, recommendations, strengths, weaknesses, action_items) VALUES (?, ?, ?, ?, ?, ?)',
        [suggestionType, score, recsStr, strStr, weakStr, actStr]
      );
      return { id: res.insertId, ...data };
    } else {
      const db = await this.readJson();
      const newSug = {
        id: db.ai_suggestions.length > 0 ? Math.max(...db.ai_suggestions.map(s => s.id)) + 1 : 1,
        type: suggestionType, score, recommendations, strengths, weaknesses, action_items,
        created_at: new Date().toISOString()
      };
      db.ai_suggestions.push(newSug);
      await this.writeJson(db);
      return newSug;
    }
  }

  // Notifications CRUD
  async getNotifications() {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      return await this.query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50');
    } else {
      const db = await this.readJson();
      return [...db.notifications]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 50);
    }
  }

  async createNotification(message, notificationType = 'info') {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      await this.execute(
        'INSERT INTO notifications (message, type, is_read) VALUES (?, ?, 0)',
        [message, notificationType]
      );
    } else {
      const db = await this.readJson();
      const newNotif = {
        id: db.notifications.length > 0 ? Math.max(...db.notifications.map(n => n.id)) + 1 : 1,
        message, type: notificationType, is_read: 0,
        created_at: new Date().toISOString()
      };
      db.notifications.push(newNotif);
      await this.writeJson(db);
    }
  }

  async markNotificationRead(id) {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      await this.execute('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    } else {
      const db = await this.readJson();
      const n = db.notifications.find(x => x.id === parseInt(id));
      if (n) {
        n.is_read = 1;
        await this.writeJson(db);
      }
    }
  }

  async clearAllNotifications() {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      await this.execute('DELETE FROM notifications');
    } else {
      const db = await this.readJson();
      db.notifications = [];
      await this.writeJson(db);
    }
  }

  // System Settings Config
  async getSettings() {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      const rows = await this.query('SELECT * FROM settings');
      const sets = {};
      rows.forEach(r => { sets[r.key_name] = r.value; });
      return sets;
    } else {
      const db = await this.readJson();
      return db.settings || {};
    }
  }

  async updateSetting(key, value) {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      // Upsert
      const existing = await this.query('SELECT 1 FROM settings WHERE key_name = ?', [key]);
      if (existing.length > 0) {
        await this.execute('UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key_name = ?', [value, key]);
      } else {
        await this.execute('INSERT INTO settings (key_name, value) VALUES (?, ?)', [key, value]);
      }
    } else {
      const db = await this.readJson();
      if (!db.settings) db.settings = {};
      db.settings[key] = value;
      await this.writeJson(db);
    }
  }

  // --- Extended Visitor & Tracking Operations ---
  async createVisitor(data) {
    const type = dbManager.getType();
    const { user_id, name, email, phone, country, company, ip_address, browser, os, device_type } = data;
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      const res = await this.execute(
        `INSERT INTO visitors (user_id, name, email, phone, country, company, ip_address, browser, os, device_type, last_activity) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [user_id || null, name, email || '', phone || '', country || 'Unknown', company || '', ip_address, browser, os, device_type]
      );
      return res.insertId;
    } else {
      const db = await this.readJson();
      if (!db.visitors) db.visitors = [];
      const newVisitor = {
        id: db.visitors.length + 1,
        user_id: user_id || null,
        name: name || 'Guest',
        email: email || '',
        phone: phone || '',
        country: country || 'Unknown',
        company: company || '',
        login_time: new Date().toISOString(),
        logout_time: null,
        ip_address, browser, os, device_type,
        last_activity: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      db.visitors.push(newVisitor);
      await this.writeJson(db);
      return newVisitor.id;
    }
  }

  async updateVisitorLogout(visitorId) {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      await this.execute('UPDATE visitors SET logout_time = CURRENT_TIMESTAMP WHERE id = ?', [visitorId]);
    } else {
      const db = await this.readJson();
      if (db.visitors) {
        const v = db.visitors.find(x => x.id === parseInt(visitorId));
        if (v) v.logout_time = new Date().toISOString();
        await this.writeJson(db);
      }
    }
  }

  async updateVisitorActivity(visitorId) {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      await this.execute('UPDATE visitors SET last_activity = CURRENT_TIMESTAMP WHERE id = ?', [visitorId]);
    } else {
      const db = await this.readJson();
      if (db.visitors) {
        const v = db.visitors.find(x => x.id === parseInt(visitorId));
        if (v) v.last_activity = new Date().toISOString();
        await this.writeJson(db);
      }
    }
  }

  async createVisitorActionLog(visitorId, action, details = '') {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      await this.execute(
        'INSERT INTO visitor_logs (visitor_id, action, details) VALUES (?, ?, ?)',
        [visitorId, action, details]
      );
    } else {
      const db = await this.readJson();
      if (!db.visitor_logs) db.visitor_logs = [];
      const newLog = {
        id: db.visitor_logs.length + 1,
        visitor_id: parseInt(visitorId),
        action, details,
        created_at: new Date().toISOString()
      };
      db.visitor_logs.push(newLog);
      await this.writeJson(db);
    }
  }

  async createResumeDownload(data) {
    const type = dbManager.getType();
    const { name, email, device, browser, os, country, ip } = data;
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      const res = await this.execute(
        `INSERT INTO resume_downloads (visitor_name, email, device, browser, os, country, ip_address) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, email, device, browser, os, country, ip]
      );
      return res.insertId;
    } else {
      const db = await this.readJson();
      if (!db.resume_downloads) db.resume_downloads = [];
      const newDl = {
        id: db.resume_downloads.length + 1,
        visitor_name: name,
        email,
        download_time: new Date().toISOString(),
        device, browser, os, country,
        ip_address: ip
      };
      db.resume_downloads.push(newDl);
      await this.writeJson(db);
      return newDl.id;
    }
  }

  async getAllUsers() {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      return await this.query('SELECT id, name, email, phone, role, country, profession, company, created_at FROM users');
    } else {
      const db = await this.readJson();
      return db.users.map(u => ({
        id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role,
        country: u.country, profession: u.profession, company: u.company, created_at: u.created_at
      }));
    }
  }

  async deleteUser(id) {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      await this.execute('DELETE FROM users WHERE id = ?', [id]);
      return true;
    } else {
      const db = await this.readJson();
      db.users = db.users.filter(u => u.id !== parseInt(id));
      await this.writeJson(db);
      return true;
    }
  }

  async getAdminDashboardMetrics() {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      const today = new Date().toISOString().slice(0, 10);
      
      const totalVisitors = await this.query('SELECT COUNT(*) as count FROM visitors');
      const todayVisitors = await this.query(`SELECT COUNT(*) as count FROM visitors WHERE login_time >= ?`, [today]);
      
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const weeklyVisitors = await this.query(`SELECT COUNT(*) as count FROM visitors WHERE login_time >= ?`, [sevenDaysAgo]);
      
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const monthlyVisitors = await this.query(`SELECT COUNT(*) as count FROM visitors WHERE login_time >= ?`, [thirtyDaysAgo]);

      const downloads = await this.query('SELECT COUNT(*) as count FROM resume_downloads');
      const projectViews = await this.query('SELECT SUM(views) as count FROM projects');
      
      const activeTimeLimit = new Date(Date.now() - 15 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);
      const loggedInUsers = await this.query('SELECT COUNT(*) as count FROM visitors WHERE logout_time IS NULL AND last_activity >= ?', [activeTimeLimit]);

      const contactMessages = await this.query('SELECT COUNT(*) as count FROM messages');

      return {
        totalVisitors: totalVisitors[0]?.count || 0,
        todayVisitors: todayVisitors[0]?.count || 0,
        weeklyVisitors: weeklyVisitors[0]?.count || 0,
        monthlyVisitors: monthlyVisitors[0]?.count || 0,
        downloads: downloads[0]?.count || 0,
        projectViews: projectViews[0]?.count || 0,
        loggedInUsers: loggedInUsers[0]?.count || 0,
        contactMessages: contactMessages[0]?.count || 0
      };
    } else {
      const db = await this.readJson();
      const visitors = db.visitors || [];
      const downloads = db.resume_downloads || [];
      const messages = db.messages || [];
      const projects = db.projects || [];

      const today = new Date().toISOString().slice(0, 10);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      const activeTimeLimit = Date.now() - 15 * 60 * 1000;

      return {
        totalVisitors: visitors.length,
        todayVisitors: visitors.filter(v => v.login_time && v.login_time.slice(0, 10) >= today).length,
        weeklyVisitors: visitors.filter(v => v.login_time && v.login_time.slice(0, 10) >= sevenDaysAgo).length,
        monthlyVisitors: visitors.filter(v => v.login_time && v.login_time.slice(0, 10) >= thirtyDaysAgo).length,
        downloads: downloads.length,
        projectViews: projects.reduce((acc, p) => acc + (p.views || 0), 0),
        loggedInUsers: visitors.filter(v => !v.logout_time && new Date(v.last_activity).getTime() >= activeTimeLimit).length,
        contactMessages: messages.length
      };
    }
  }

  async getAdminAnalytics() {
    const type = dbManager.getType();
    if (type === DB_TYPES.MYSQL || type === DB_TYPES.SQLITE) {
      const topCountries = await this.query('SELECT country, COUNT(*) as count FROM visitors GROUP BY country ORDER BY count DESC LIMIT 5');
      const topBrowsers = await this.query('SELECT browser, COUNT(*) as count FROM visitors GROUP BY browser ORDER BY count DESC LIMIT 5');
      const topDevices = await this.query('SELECT device_type as device, COUNT(*) as count FROM visitors GROUP BY device_type ORDER BY count DESC LIMIT 5');
      const returningVisitors = await this.query('SELECT COUNT(*) as count FROM visitors WHERE user_id IS NOT NULL');
      const recentVisitors = await this.query('SELECT * FROM visitors ORDER BY login_time DESC LIMIT 20');

      const trafficTimeline = await this.query(
        `SELECT DATE(login_time) as date, COUNT(*) as count 
         FROM visitors 
         GROUP BY DATE(login_time) 
         ORDER BY date ASC LIMIT 15`
      );

      return {
        topCountries,
        topBrowsers,
        topDevices,
        returningVisitors: returningVisitors[0]?.count || 0,
        trafficTimeline,
        recentVisitors
      };
    } else {
      const db = await this.readJson();
      const visitors = db.visitors || [];
      
      const countries = {};
      const browsers = {};
      const devices = {};
      visitors.forEach(v => {
        countries[v.country] = (countries[v.country] || 0) + 1;
        browsers[v.browser] = (browsers[v.browser] || 0) + 1;
        devices[v.device_type] = (devices[v.device_type] || 0) + 1;
      });

      const recentVisitors = [...visitors].sort((a, b) => new Date(b.login_time) - new Date(a.login_time)).slice(0, 20);

      return {
        topCountries: Object.entries(countries).map(([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count).slice(0, 5),
        topBrowsers: Object.entries(browsers).map(([browser, count]) => ({ browser, count })).sort((a, b) => b.count - a.count).slice(0, 5),
        topDevices: Object.entries(devices).map(([device, count]) => ({ device, count })).sort((a, b) => b.count - a.count).slice(0, 5),
        returningVisitors: visitors.filter(v => v.user_id !== null).length,
        trafficTimeline: [],
        recentVisitors
      };
    }
  }
}

const databaseService = new DatabaseService();
export default databaseService;
