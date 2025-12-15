import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    return Response.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return Response.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
