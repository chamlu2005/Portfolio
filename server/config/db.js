import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define file paths for SQLite and JSON fallback
const DB_DIR = path.join(__dirname, '../../database');
const SQLITE_PATH = path.join(DB_DIR, 'portfolio_v6.sqlite');
const JSON_PATH = path.join(DB_DIR, 'portfolio_v6_data.json');

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

export const DB_TYPES = {
  MYSQL: 'MYSQL',
  SQLITE: 'SQLITE',
  JSON: 'JSON'
};

class DatabaseManager {
  constructor() {
    this.connectionType = null;
    this.mysqlPool = null;
    this.sqliteDb = null;
    this.jsonStore = null;
  }

  async initialize() {
    // 1. Try MySQL Connection
    if (process.env.DB_HOST && process.env.DB_USER) {
      try {
        console.log('⚡ Attempting to connect to MySQL...');
        const pool = mysql.createPool({
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          port: parseInt(process.env.DB_PORT || '3306'),
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0
        });

        // Test connection
        const connection = await pool.getConnection();
        connection.release();

        console.log('✅ Connected to MySQL successfully!');
        this.mysqlPool = pool;
        this.connectionType = DB_TYPES.MYSQL;
        return { type: DB_TYPES.MYSQL, client: pool };
      } catch (err) {
        console.warn('⚠️ MySQL Connection failed. Error:', err.message);
      }
    } else {
      console.log('ℹ️ MySQL credentials not provided in .env.');
    }

    // 2. Try SQLite Fallback
    try {
      console.log('⚡ Attempting to connect to SQLite...');
      // Dynamic import to prevent crashing if SQLite package is not fully compiled
      const sqlite3Module = await import('sqlite3');
      const sqlite3 = sqlite3Module.default.verbose();

      const db = new sqlite3.Database(SQLITE_PATH);
      
      // Wrap SQLite run in Promise to test connection and setup tables
      const testSqlite = () => new Promise((resolve, reject) => {
        db.run('SELECT 1', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      await testSqlite();
      console.log(`✅ Connected to SQLite successfully! Data saved at: ${SQLITE_PATH}`);
      this.sqliteDb = db;
      this.connectionType = DB_TYPES.SQLITE;
      return { type: DB_TYPES.SQLITE, client: db };
    } catch (err) {
      console.warn('⚠️ SQLite Connection/Initialization failed. Error:', err.message);
    }

    // 3. Fallback to Local JSON Storage
    console.log('⚡ Falling back to Local JSON File Storage...');
    try {
      if (!fs.existsSync(JSON_PATH)) {
        fs.writeFileSync(JSON_PATH, JSON.stringify({
          users: [],
          profile: {},
          projects: [],
          skills: [],
          experience: [],
          education: [],
          certificates: [],
          achievements: [],
          testimonials: [],
          blogs: [],
          messages: [],
          visitor_logs: [],
          analytics: [],
          ai_suggestions: [],
          settings: { theme: 'dark', ai_provider: 'offline' },
          notifications: []
        }, null, 2));
      }
      this.connectionType = DB_TYPES.JSON;
      this.jsonStore = JSON_PATH;
      console.log(`✅ JSON Storage initialized successfully! Data saved at: ${JSON_PATH}`);
      return { type: DB_TYPES.JSON, client: JSON_PATH };
    } catch (err) {
      console.error('❌ Critical: Failed to initialize JSON File Storage. App has no database connection.', err.message);
      throw err;
    }
  }

  getType() {
    return this.connectionType;
  }
}

const dbManager = new DatabaseManager();
export default dbManager;
