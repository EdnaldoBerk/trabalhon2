import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT b.*, c.name as category_name, c.color as category_color 
      FROM books b 
      LEFT JOIN categories c ON b.category_id = c.id 
      ORDER BY b.created_at DESC
    `);
    return Response.json(result.rows);
  } catch (error) {
    console.error('Error fetching books:', error);
    return Response.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { title, author, description, published_year, isbn, cover_image, category_id, reading_status, current_page } = await request.json();

    if (!title || !author) {
      return Response.json(
        { error: 'Title and author are required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'INSERT INTO books (title, author, description, published_year, isbn, cover_image, category_id, reading_status, current_page) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [title, author, description || null, published_year || null, isbn || null, cover_image || null, category_id || null, reading_status || 'quero_ler', current_page || null]
    );

    return Response.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating book:', error);
    return Response.json({ error: 'Failed to create book' }, { status: 500 });
  }
}
