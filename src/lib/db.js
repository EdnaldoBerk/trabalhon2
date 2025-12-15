import { config as loadEnv } from 'dotenv';
import { Pool } from 'pg';

// Carrega variáveis; prioriza .env.local para ambiente Next
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
    
    // Criar tabela de livros
    await client.query(`
      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        description TEXT,
        published_year INT,
        isbn VARCHAR(20) UNIQUE,
        cover_image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migrar cover_url para cover_image se existir
    await client.query('ALTER TABLE books ADD COLUMN IF NOT EXISTS cover_image TEXT');
    await client.query('UPDATE books SET cover_image = cover_url WHERE cover_image IS NULL AND cover_url IS NOT NULL');

    console.log('Database initialized successfully');
    client.release();
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export default pool;
