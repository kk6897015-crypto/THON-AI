import { DatabaseSync } from 'node:sqlite';
import { config } from './config.js';

let dbWrapper = null;

class NodeSqliteWrapper {
  constructor(filename) {
    this.rawDb = new DatabaseSync(filename);
  }

  async get(sql, params = []) {
    const p = Array.isArray(params) ? params : [params];
    const stmt = this.rawDb.prepare(sql);
    return stmt.get(...p) || undefined;
  }

  async all(sql, params = []) {
    const p = Array.isArray(params) ? params : [params];
    const stmt = this.rawDb.prepare(sql);
    return stmt.all(...p);
  }

  async run(sql, params = []) {
    const p = Array.isArray(params) ? params : [params];
    const stmt = this.rawDb.prepare(sql);
    const result = stmt.run(...p);
    return {
      lastID: result.lastInsertRowid,
      changes: result.changes
    };
  }

  async exec(sql) {
    return this.rawDb.exec(sql);
  }
}

export async function getDb() {
  if (dbWrapper) return dbWrapper;

  try {
    dbWrapper = new NodeSqliteWrapper(config.dbPath || './teamlaunch.sqlite');
  } catch (err) {
    // Fallback if node:sqlite fails
    const sqlite3 = await import('sqlite3');
    const { open } = await import('sqlite');
    dbWrapper = await open({
      filename: config.dbPath || './teamlaunch.sqlite',
      driver: sqlite3.default.Database
    });
  }

  // Initialize tables if not exist
  await dbWrapper.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      college TEXT,
      department TEXT,
      year_of_study TEXT,
      skills TEXT,
      resume_link TEXT,
      phone TEXT,
      razorpay_subscription_id TEXT,
      subscription_status TEXT DEFAULT 'none',
      subscription_valid_until DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      invite_code TEXT UNIQUE NOT NULL,
      leader_id TEXT NOT NULL,
      point_of_contact_phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (leader_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS team_members (
      team_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (team_id, user_id),
      FOREIGN KEY (team_id) REFERENCES teams (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS competitions (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      title TEXT NOT NULL,
      source_url TEXT,
      platform TEXT,
      level TEXT DEFAULT 'national',
      tags TEXT,
      deadline TEXT,
      eligibility_raw_text TEXT,
      status TEXT DEFAULT 'saved',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams (id)
    );

    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      competition_id TEXT NOT NULL,
      status TEXT DEFAULT 'saved',
      notes TEXT,
      submitted_by TEXT,
      submitted_at DATETIME,
      FOREIGN KEY (team_id) REFERENCES teams (id),
      FOREIGN KEY (competition_id) REFERENCES competitions (id)
    );

    CREATE TABLE IF NOT EXISTS idea_briefs (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      problem TEXT NOT NULL,
      solution TEXT NOT NULL,
      tech_stack TEXT,
      novelty_notes TEXT,
      related_works TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams (id)
    );

    CREATE TABLE IF NOT EXISTS decks (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      competition_id TEXT,
      title TEXT NOT NULL,
      draft_sections TEXT,
      per_slide_checklists TEXT,
      version INTEGER DEFAULT 1,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams (id)
    );

    CREATE TABLE IF NOT EXISTS eligibility_checks (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      competition_id TEXT NOT NULL,
      checklist TEXT,
      completeness TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      team_id TEXT UNIQUE NOT NULL,
      plan TEXT DEFAULT 'free',
      stripe_or_razorpay_id TEXT,
      status TEXT DEFAULT 'active',
      applications_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams (id)
    );

    CREATE TABLE IF NOT EXISTS telegram_links (
      id TEXT PRIMARY KEY,
      team_id TEXT UNIQUE NOT NULL,
      chat_id TEXT,
      bot_token TEXT,
      verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams (id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      subscription_id TEXT,
      payment_id TEXT,
      amount INTEGER,
      currency TEXT DEFAULT 'INR',
      status TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
  `);

  // Run dynamic schema migrations for newly required columns
  try {
    const userColumns = await dbWrapper.all("PRAGMA table_info(users)");
    const userColNames = userColumns.map(c => c.name);
    if (!userColNames.includes('razorpay_subscription_id')) {
      await dbWrapper.exec(`ALTER TABLE users ADD COLUMN razorpay_subscription_id TEXT`);
    }
    if (!userColNames.includes('subscription_status')) {
      await dbWrapper.exec(`ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'none'`);
    }
    if (!userColNames.includes('subscription_valid_until')) {
      await dbWrapper.exec(`ALTER TABLE users ADD COLUMN subscription_valid_until DATETIME`);
    }
  } catch (err) {
    console.warn('Database users migrations skipped or failed:', err.message);
  }
  try {
    const columns = await dbWrapper.all("PRAGMA table_info(competitions)");
    const colNames = columns.map(c => c.name);
    if (!colNames.includes('visibility')) {
      await dbWrapper.exec(`ALTER TABLE competitions ADD COLUMN visibility TEXT DEFAULT 'private'`);
    }
    if (!colNames.includes('state')) {
      await dbWrapper.exec(`ALTER TABLE competitions ADD COLUMN state TEXT`);
    }
    if (!colNames.includes('college_tier')) {
      await dbWrapper.exec(`ALTER TABLE competitions ADD COLUMN college_tier TEXT DEFAULT 'unknown'`);
    }
    if (!colNames.includes('is_shared')) {
      await dbWrapper.exec(`ALTER TABLE competitions ADD COLUMN is_shared INTEGER DEFAULT 0`);
    }
    if (!colNames.includes('shared_at')) {
      await dbWrapper.exec(`ALTER TABLE competitions ADD COLUMN shared_at TEXT`);
    }
    if (!colNames.includes('needs_verification')) {
      await dbWrapper.exec(`ALTER TABLE competitions ADD COLUMN needs_verification INTEGER DEFAULT 0`);
    }
    if (!colNames.includes('verified_at')) {
      await dbWrapper.exec(`ALTER TABLE competitions ADD COLUMN verified_at TEXT`);
    }
  } catch (err) {
    console.warn('Database competitions migrations skipped or failed:', err.message);
  }

  // Seed shared competitions if not present
  try {
    const existing = await dbWrapper.all("SELECT COUNT(*) as count FROM competitions WHERE visibility = 'shared'");
    const count = existing?.[0]?.count || 0;
    if (count === 0) {
      // Ensure system user and team exist for foreign key compliance
      const systemUser = await dbWrapper.get("SELECT id FROM users WHERE id = 'system_user'");
      if (!systemUser) {
        await dbWrapper.run(
          `INSERT INTO users (id, name, email, password) VALUES ('system_user', 'System Admin', 'system@teamlaunch.app', 'system_pwd_hash')`
        );
      }
      const systemTeam = await dbWrapper.get("SELECT id FROM teams WHERE id = 'system_team'");
      if (!systemTeam) {
        await dbWrapper.run(
          `INSERT INTO teams (id, name, invite_code, leader_id) VALUES ('system_team', 'Tamil Nadu Hackathon Hub', 'SYSTN1', 'system_user')`
        );
      }

      // Seed demo user and team for 1-click evaluation
      const demoUser = await dbWrapper.get("SELECT id FROM users WHERE email = 'demo@teamlaunch.io'");
      if (!demoUser) {
        await dbWrapper.run(
          `INSERT INTO users (id, name, email, password, college, department, year_of_study, skills, phone)
           VALUES ('demo_user', 'Demo Leader', 'demo@teamlaunch.io', '$2a$10$68ZxW43sHnqNj6xQ58.xQeo4q47zLm7sIkIjNl0k7CnoMDCyfMTdS', 'IIT Madras', 'Computer Science', '3rd Year', '["React","Node.js","AI","Python"]', '+91 9876543210')`
        );
      }
      const demoTeam = await dbWrapper.get("SELECT id FROM teams WHERE leader_id = 'demo_user' OR name = 'Alpha Innovators'");
      if (!demoTeam) {
        await dbWrapper.run(
          `INSERT INTO teams (id, name, invite_code, leader_id, point_of_contact_phone)
           VALUES ('demo_team', 'Alpha Innovators', 'ALPH01', 'demo_user', '+91 9876543210')`
        );
        await dbWrapper.run(
          `INSERT OR IGNORE INTO team_members (team_id, user_id) VALUES ('demo_team', 'demo_user')`
        );
      }
      const SEED_SHARED_COMPETITIONS = [
        {
          title: 'Anna University CEG Innothon 2026',
          source_url: 'https://annauniv.edu/innothon',
          platform: 'Anna University CEG',
          level: 'state',
          tags: ['AI', 'GovTech', 'TamilNadu'],
          deadline_days: 15,
          eligibility_raw_text: 'Open to Anna University campus students and all affiliated colleges in Tamil Nadu. Team size: 2-4 members.',
          state: 'Tamil Nadu',
          college_tier: 'state_tier1'
        },
        {
          title: 'PSG Tech iTech Hackfest 2026',
          source_url: 'https://psgtech.edu/itech-hackfest',
          platform: 'PSG Tech',
          level: 'state',
          tags: ['Embedded', 'IoT', 'TamilNadu'],
          deadline_days: 18,
          eligibility_raw_text: 'Organized by PSG College of Technology, Coimbatore. Open to all engineering colleges in Tamil Nadu.',
          state: 'Tamil Nadu',
          college_tier: 'state_tier1'
        },
        {
          title: 'SRM Kattankulathur Hackfest 2026',
          source_url: 'https://srmist.edu.in/hackfest',
          platform: 'SRM KTR',
          level: 'national',
          tags: ['Web3', 'AI', 'Blockchain'],
          deadline_days: 22,
          eligibility_raw_text: 'Open to college students across India. Organized by SRM Chennai.',
          state: 'Tamil Nadu',
          college_tier: 'state_tier1'
        },
        {
          title: 'VIT Chennai DevSpace Hackathon 2026',
          source_url: 'https://chennai.vit.ac.in/devspace',
          platform: 'VIT Chennai',
          level: 'national',
          tags: ['AppDev', 'Cloud', 'Design'],
          deadline_days: 10,
          eligibility_raw_text: 'Hosted by VIT Chennai campus. Open to all streams of engineering and computer applications.',
          state: 'Tamil Nadu',
          college_tier: 'state_tier1'
        },
        {
          title: 'NIT Trichy Hackerspace 2026',
          source_url: 'https://nitt.edu/hackerspace',
          platform: 'NIT Trichy',
          level: 'national',
          tags: ['Algorithms', 'Systems', 'FOSS'],
          deadline_days: 25,
          eligibility_raw_text: 'Hosted by NIT Tiruchirappalli. open to undergraduate students from IITs, NITs, IIITs, and all top tier institutions.',
          state: 'Tamil Nadu',
          college_tier: 'iit_nit_iiit'
        },
        {
          title: 'IIT Madras Shaastra Hackathon 2026',
          source_url: 'https://shaastra.org',
          platform: 'IIT Madras',
          level: 'national',
          tags: ['DeepTech', 'AI', 'Hardware'],
          deadline_days: 12,
          eligibility_raw_text: 'Shaastra 2026 flagship hackathon. Open to all students nationwide.',
          state: 'Tamil Nadu',
          college_tier: 'iit_nit_iiit'
        },
        {
          title: 'Smart India Hackathon (SIH) Tamil Nadu Nodal Center 2026',
          source_url: 'https://sih.gov.in',
          platform: 'SIH Portal',
          level: 'national',
          tags: ['GovTech', 'Hardware', 'Software'],
          deadline_days: 30,
          eligibility_raw_text: '6-member team mandatory with at least 1 female member. Must be nominated by college SPOC.',
          state: 'Tamil Nadu',
          college_tier: 'other'
        }
      ];

      for (const item of SEED_SHARED_COMPETITIONS) {
        const compId = 'comp_seed_' + Math.random().toString(36).substring(2, 9);
        const deadlineDate = new Date(Date.now() + item.deadline_days * 86400000).toISOString();
        await dbWrapper.run(
          `INSERT INTO competitions (id, team_id, title, source_url, platform, level, tags, deadline, eligibility_raw_text, status, visibility, state, college_tier, is_shared, shared_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'saved', 'shared', ?, ?, 1, CURRENT_TIMESTAMP)`,
          [
            compId,
            'system_team',
            item.title,
            item.source_url,
            item.platform,
            item.level,
            JSON.stringify(item.tags),
            deadlineDate,
            item.eligibility_raw_text,
            item.state,
            item.college_tier
          ]
        );
      }
      console.log('Seeded shared competitions successfully.');
    }
  } catch (err) {
    console.warn('Database competitions seeding failed:', err.message);
  }

  return dbWrapper;
}

