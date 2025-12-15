# 📚 Biblioteca Virtual

Sistema completo de gerenciamento de biblioteca pessoal desenvolvido com Next.js 16, React 19 e PostgreSQL (Neon).

## ✨ Funcionalidades

- **CRUD Completo de Livros**
  - Criar, visualizar, editar e deletar livros
  - Upload de capas (base64, máx 2MB)
  - Preview de imagem antes de salvar

- **Categorização**
  - 10 categorias pré-definidas com cores personalizadas
  - Ficção, Romance, Suspense, Técnico, Biografia, Fantasia, Científico, História, Autoajuda, Outros

- **Status de Leitura**
  - 📚 Quero Ler
  - 📖 Lendo Agora (com indicador de página atual)
  - ✅ Concluído

- **Interface Moderna**
  - Design dark mode com gradientes
  - Notificações toast elegantes
  - Modal de confirmação customizado
  - Layout responsivo com grid adaptativo
  - Animações suaves

## 🛠️ Tecnologias

- **Frontend:** Next.js 16 (App Router), React 19
- **Backend:** Next.js API Routes
- **Banco de Dados:** PostgreSQL (Vercel Neon)
- **Estilização:** CSS Modules
- **Node Driver:** pg 8.16.3

## 📸 Screenshots

### Tela Principal
![Biblioteca Virtual - Tela Principal](../site1.png)

### Gerenciamento de Livros
![Biblioteca Virtual - Gerenciamento](../site2.png)

### Interface Completa
![Biblioteca Virtual - Interface](../site3.png)

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+
- Conta no Vercel Neon (PostgreSQL)

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/EdnaldoBerk/trabalhon2.git
cd trabalhon2
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:

Crie um arquivo `.env.local` na raiz do projeto:
```env
DATABASE_URL=sua_connection_string_do_neon
```

4. Inicialize o banco de dados:
```bash
npm run init-db
```

5. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

6. Acesse no navegador:
```
http://localhost:3000
```

## 📦 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm start` - Inicia servidor de produção
- `npm run init-db` - Inicializa/migra o banco de dados

## 🗄️ Estrutura do Banco de Dados

### Tabela `categories`
- `id` - Serial Primary Key
- `name` - VARCHAR(100) UNIQUE
- `color` - VARCHAR(7) (hex color)

### Tabela `books`
- `id` - Serial Primary Key
- `title` - VARCHAR(255) NOT NULL
- `author` - VARCHAR(255) NOT NULL
- `description` - TEXT
- `published_year` - INT
- `isbn` - VARCHAR(20) UNIQUE
- `cover_image` - TEXT (base64)
- `category_id` - INT (FK → categories)
- `reading_status` - VARCHAR(20) ('quero_ler', 'lendo', 'concluido')
- `current_page` - INT
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

## 🎨 Características do Design

- **Paleta de Cores:** Tons escuros (#0b1220 - #111827) com accent cyan (#38bdf8)
- **Tipografia:** System fonts com Geist Sans
- **Componentes:**
  - Cards com hover effects e sombras
  - Badges coloridas para categorias e status
  - Botões com estados hover e animações
  - Modais com backdrop blur
  - Notificações toast com auto-dismiss (3s)

## 🔒 Segurança

- Validação de tipos de arquivo (apenas imagens)
- Limite de tamanho de upload (2MB)
- Sanitização de inputs
- Prepared statements (SQL injection prevention)
- SSL habilitado para conexão com banco

## 📝 Licença

Este projeto foi desenvolvido para fins educacionais.

## 👤 Autor

**EdnaldoBerk**
- GitHub: [@EdnaldoBerk](https://github.com/EdnaldoBerk)

---

Desenvolvido com ❤️ usando Next.js e React
