import { config as loadEnv } from 'dotenv';
import { Pool } from 'pg';

loadEnv({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const initDatabase = async () => {
  try {
    const client = await pool.connect();
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        color VARCHAR(7) DEFAULT '#38bdf8',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        description TEXT,
        published_year INT,
        isbn VARCHAR(20) UNIQUE,
        cover_image TEXT,
        category_id INT REFERENCES categories(id) ON DELETE SET NULL,
        reading_status VARCHAR(20) DEFAULT 'quero_ler' CHECK (reading_status IN ('quero_ler', 'lendo', 'concluido')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query('ALTER TABLE books ADD COLUMN IF NOT EXISTS cover_image TEXT');
    await client.query('ALTER TABLE books ADD COLUMN IF NOT EXISTS category_id INT');
    await client.query('ALTER TABLE books ADD COLUMN IF NOT EXISTS reading_status VARCHAR(20) DEFAULT \'quero_ler\'');
    await client.query('ALTER TABLE books ADD COLUMN IF NOT EXISTS current_page INT');
    await client.query('UPDATE books SET cover_image = cover_url WHERE cover_image IS NULL AND cover_url IS NOT NULL');
    await client.query('ALTER TABLE books DROP COLUMN IF EXISTS cover_url');

    await client.query(`
      INSERT INTO categories (name, color) VALUES
        ('Ficção', '#8b5cf6'),
        ('Romance', '#ec4899'),
        ('Suspense', '#ef4444'),
        ('Técnico', '#10b981'),
        ('Biografia', '#f59e0b'),
        ('Fantasia', '#6366f1'),
        ('Científico', '#06b6d4'),
        ('História', '#84cc16'),
        ('Autoajuda', '#f97316'),
        ('Outros', '#6b7280')
      ON CONFLICT (name) DO NOTHING
    `);

    client.release();
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export default pool;
