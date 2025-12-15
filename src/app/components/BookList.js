'use client';

import { useState, useEffect } from 'react';
import styles from '@/style/page.module.css';

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    published_year: '',
    isbn: '',
    cover_image: '',
  });
  const [imagePreview, setImagePreview] = useState('');

  // Buscar livros ao carregar
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/books', { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
      alert('Erro ao carregar livros');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setImagePreview('');
      setFormData(prev => ({ ...prev, cover_image: '' }));
      return;
    }

    // Validar tipo e tamanho
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem');
      e.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 2MB');
      e.target.value = '';
      return;
    }

    // Converter para base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setImagePreview(base64String);
      setFormData(prev => ({ ...prev, cover_image: base64String }));
    };
    reader.onerror = () => {
      alert('Erro ao ler a imagem');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.author) {
      alert('Título e autor são obrigatórios');
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/books/${editingId}` : '/api/books';

      const payload = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        description: formData.description?.trim() || null,
        published_year: formData.published_year ? Number(formData.published_year) : null,
        isbn: formData.isbn?.trim() || null,
        cover_image: formData.cover_image || null,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save');
      
      alert(editingId ? 'Livro atualizado!' : 'Livro criado!');
      resetForm();
      fetchBooks();
    } catch (error) {
      console.error('Error saving book:', error);
      alert('Erro ao salvar livro');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este livro?')) return;

    try {
      const response = await fetch(`/api/books/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        // Se já não existir, tratamos como sucesso para manter consistência
        if (response.status === 404) {
          alert('Livro já removido. Atualizando lista...');
          fetchBooks();
          return;
        }

        const errText = await response.text();
        throw new Error(errText || 'Failed to delete');
      }
      
      alert('Livro deletado!');
      // Atualiza imediatamente a lista local
      setBooks(prev => prev.filter(b => b.id !== id && b.id !== Number(id)));
      fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Erro ao deletar livro');
    }
  };

  const handleEdit = (book) => {
    setFormData({
      ...book,
      cover_image: book.cover_image || '',
    });
    setImagePreview(book.cover_image || '');
    setEditingId(book.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      description: '',
      published_year: '',
      isbn: '',
      cover_image: '',
    });
    setImagePreview('');
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className={styles.container}>
      <h1>Adicione e gerencie seus livros</h1>

      <button 
        onClick={() => setShowForm(!showForm)}
        className={styles.btn}
      >
        {showForm ? 'Cancelar' : 'Novo Livro'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <h2>{editingId ? 'Editar Livro' : 'Novo Livro'}</h2>

          <input
            type="text"
            name="title"
            placeholder="Título"
            value={formData.title}
            onChange={handleInputChange}
            required
          />

          <input
            type="text"
            name="author"
            placeholder="Autor"
            value={formData.author}
            onChange={handleInputChange}
            required
          />

          <textarea
            name="description"
            placeholder="Descrição"
            value={formData.description}
            onChange={handleInputChange}
          />

          <input
            type="number"
            name="published_year"
            placeholder="Ano de publicação"
            value={formData.published_year}
            onChange={handleInputChange}
          />

          <input
            type="text"
            name="isbn"
            placeholder="ISBN"
            value={formData.isbn}
            onChange={handleInputChange}
          />

          <div className={styles.fileInputWrapper}>
            <label htmlFor="cover_image" className={styles.fileLabel}>
              {imagePreview ? 'Alterar capa' : 'Adicionar capa'}
            </label>
            <input
              id="cover_image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={styles.fileInput}
            />
            {imagePreview && (
              <div className={styles.previewWrapper}>
                <img
                  src={imagePreview}
                  alt="Preview da capa"
                  className={styles.previewImage}
                />
              </div>
            )}
          </div>

          <button type="submit" className={styles.btnSuccess}>
            {editingId ? 'Atualizar' : 'Criar'}
          </button>
        </form>
      )}

      {loading ? (
        <p>Carregando...</p>
      ) : books.length === 0 ? (
        <p>Nenhum livro cadastrado. Comece adicionando um novo!</p>
      ) : (
        <div className={styles.booksList}>
          {books.map(book => (
            <div key={book.id} className={styles.bookCard}>
              {book.cover_image && (
                <div className={styles.coverWrapper}>
                  <img
                    src={book.cover_image}
                    alt={`Capa de ${book.title}`}
                    className={styles.coverImage}
                  />
                </div>
              )}
              <h3>{book.title}</h3>
              <p><strong>Autor:</strong> {book.author}</p>
              {book.description && <p><strong>Descrição:</strong> {book.description}</p>}
              {book.published_year && <p><strong>Ano:</strong> {book.published_year}</p>}
              {book.isbn && <p><strong>ISBN:</strong> {book.isbn}</p>}
              
              <div className={styles.actions}>
                <button 
                  onClick={() => handleEdit(book)}
                  className={styles.btnEdit}
                >
                  Editar
                </button>
                <button 
                  onClick={() => handleDelete(book.id)}
                  className={styles.btnDelete}
                >
                  Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
