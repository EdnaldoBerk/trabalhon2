'use client';

import { useState, useEffect } from 'react';
import styles from '@/style/page.module.css';

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    published_year: '',
    isbn: '',
    cover_image: '',
    category_id: '',
    reading_status: 'quero_ler',
    current_page: '',
  });
  const [imagePreview, setImagePreview] = useState('');

  // Buscar livros ao carregar
  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/books', { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
      showNotification('Erro ao carregar livros', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value || ''
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
      showNotification('Por favor, selecione apenas arquivos de imagem', 'error');
      e.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showNotification('A imagem deve ter no máximo 2MB', 'error');
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
      showNotification('Erro ao ler a imagem', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.author) {
      showNotification('Título e autor são obrigatórios', 'error');
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
        category_id: formData.category_id ? Number(formData.category_id) : null,
        reading_status: formData.reading_status || 'quero_ler',
        current_page: formData.current_page ? Number(formData.current_page) : null,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save');
      
      showNotification(editingId ? 'Livro atualizado com sucesso!' : 'Livro criado com sucesso!');
      resetForm();
      fetchBooks();
    } catch (error) {
      console.error('Error saving book:', error);
      showNotification('Erro ao salvar livro', 'error');
    }
  };

  const handleDelete = async (id) => {
    setConfirmModal({
      message: 'Tem certeza que deseja deletar este livro?',
      onConfirm: () => executeDelete(id)
    });
  };

  const executeDelete = async (id) => {
    setConfirmModal(null);

    try {
      const response = await fetch(`/api/books/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        // Se já não existir, tratamos como sucesso para manter consistência
        if (response.status === 404) {
          showNotification('Livro já removido', 'info');
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
      showNotification('Erro ao deletar livro', 'error');
    }
  };

  const handleConfirmModalClose = () => {
    setConfirmModal(null);
  };

  const handleEdit = (book) => {
    setFormData({
      title: book.title || '',
      author: book.author || '',
      description: book.description || '',
      published_year: book.published_year || '',
      isbn: book.isbn || '',
      cover_image: book.cover_image || '',
      category_id: book.category_id || '',
      reading_status: book.reading_status || 'quero_ler',
      current_page: book.current_page || '',
    });
    setImagePreview(book.cover_image || '');
    setEditingId(book.id);
    setShowForm(true);
    
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      description: '',
      published_year: '',
      isbn: '',
      cover_image: '',
      category_id: '',
      reading_status: 'quero_ler',
      current_page: '',
    });
    setImagePreview('');
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className={styles.container}>
      {notification && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          {notification.message}
        </div>
      )}

      {confirmModal && (
        <div className={styles.modalOverlay} onClick={handleConfirmModalClose}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Confirmação</h3>
            <p>{confirmModal.message}</p>
            <div className={styles.modalActions}>
              <button 
                onClick={handleConfirmModalClose}
                className={styles.btnCancel}
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  confirmModal.onConfirm();
                  handleConfirmModalClose();
                }}
                className={styles.btnConfirm}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
      
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

          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleInputChange}
            className={styles.select}
          >
            <option value="">Selecione uma categoria</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <select
            name="reading_status"
            value={formData.reading_status}
            onChange={handleInputChange}
            className={styles.select}
          >
            <option value="quero_ler">Quero Ler</option>
            <option value="lendo">Lendo Agora</option>
            <option value="concluido">Concluído</option>
          </select>

          {formData.reading_status === 'lendo' && (
            <input
              type="number"
              name="current_page"
              placeholder="Página atual"
              value={formData.current_page}
              onChange={handleInputChange}
              min="0"
            />
          )}

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
              <div className={styles.bookContent}>
                <h3>{book.title}</h3>
                <p><strong>Autor:</strong> {book.author}</p>
                {book.description && <p><strong>Descrição:</strong> {book.description}</p>}
                {book.published_year && <p><strong>Ano:</strong> {book.published_year}</p>}
                {book.isbn && <p><strong>ISBN:</strong> {book.isbn}</p>}
              </div>
              
              <div className={styles.badges}>
                {book.category_name && (
                  <span 
                    className={styles.badge} 
                    style={{ backgroundColor: book.category_color || '#38bdf8' }}
                  >
                    {book.category_name}
                  </span>
                )}
                <span className={`${styles.badge} ${styles[book.reading_status || 'quero_ler']}`}>
                  {book.reading_status === 'quero_ler' ? '📚 Quero Ler' : 
                   book.reading_status === 'lendo' ? `📖 Lendo${book.current_page ? ` - Pág. ${book.current_page}` : ''}` : 
                   '✅ Concluído'}
                </span>
              </div>
              
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
