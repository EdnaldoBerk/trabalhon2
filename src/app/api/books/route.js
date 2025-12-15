import pool from '@/lib/db';

// GET - Listar todos os livros
export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM books ORDER BY created_at DESC');
    return Response.json(result.rows);
  } catch (error) {
    console.error('Error fetching books:', error);
    return Response.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}

// POST - Criar novo livro
export async function POST(request) {
  try {
    const { title, author, description, published_year, isbn, cover_image } = await request.json();

    if (!title || !author) {
      return Response.json(
        { error: 'Title and author are required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'INSERT INTO books (title, author, description, published_year, isbn, cover_image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, author, description || null, published_year || null, isbn || null, cover_image || null]
    );

    return Response.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating book:', error);
    return Response.json({ error: 'Failed to create book' }, { status: 500 });
  }
}
