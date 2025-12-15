import 'dotenv/config.js';
import pool, { initDatabase } from '../src/lib/db.js';

async function runInitialization() {
  try {
    console.log('🚀 Iniciando banco de dados...');
    await initDatabase();
    console.log('✅ Banco de dados inicializado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
    process.exit(1);
  }
}

runInitialization();
