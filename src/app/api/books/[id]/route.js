import pool from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const result = await pool.query(`
      SELECT b.*, c.name as category_name, c.color as category_color 
      FROM books b 
      LEFT JOIN categories c ON b.category_id = c.id 
      WHERE b.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return Response.json({ error: 'Book not found' }, { status: 404 });
    }

    return Response.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching book:', error);
    return Response.json({ error: 'Failed to fetch book' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { title, author, description, published_year, isbn, cover_image, category_id, reading_status, current_page } = await request.json();

    const result = await pool.query(
      'UPDATE books SET title = $1, author = $2, description = $3, published_year = $4, isbn = $5, cover_image = $6, category_id = $7, reading_status = $8, current_page = $9, updated_at = CURRENT_TIMESTAMP WHERE id = $10 RETURNING *',
      [title, author, description || null, published_year || null, isbn || null, cover_image || null, category_id || null, reading_status || 'quero_ler', current_page || null, id]
    );

    if (result.rows.length === 0) {
      return Response.json({ error: 'Book not found' }, { status: 404 });
    }

    return Response.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating book:', error);
    return Response.json({ error: 'Failed to update book' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const result = await pool.query('DELETE FROM books WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return Response.json({ error: 'Book not found' }, { status: 404 });
    }

    return Response.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    return Response.json({ error: 'Failed to delete book' }, { status: 500 });
  }
}
