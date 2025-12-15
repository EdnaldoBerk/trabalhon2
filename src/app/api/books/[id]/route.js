import pool from '@/lib/db';

// GET - Buscar livro por ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const result = await pool.query('SELECT * FROM books WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      console.warn('GET book not found', { id });
      return Response.json({ error: 'Book not found' }, { status: 404 });
    }

    console.log('GET book', { id });
    return Response.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching book:', error);
    return Response.json({ error: 'Failed to fetch book' }, { status: 500 });
  }
}

// PUT - Atualizar livro
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { title, author, description, published_year, isbn, cover_image } = await request.json();

    const result = await pool.query(
      'UPDATE books SET title = $1, author = $2, description = $3, published_year = $4, isbn = $5, cover_image = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
      [title, author, description || null, published_year || null, isbn || null, cover_image || null, id]
    );

    if (result.rows.length === 0) {
      console.warn('PUT book not found', { id });
      return Response.json({ error: 'Book not found' }, { status: 404 });
    }

    console.log('PUT book', { id });
    return Response.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating book:', error);
    return Response.json({ error: 'Failed to update book' }, { status: 500 });
  }
}

// DELETE - Deletar livro
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const result = await pool.query('DELETE FROM books WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      console.warn('DELETE book not found', { id });
      return Response.json({ error: 'Book not found' }, { status: 404 });
    }

    console.log('DELETE book', { id });
    return Response.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    return Response.json({ error: 'Failed to delete book' }, { status: 500 });
  }
}
