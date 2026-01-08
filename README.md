# 🛒 TechShop MVP — E-commerce Full‑Stack

Projeto **full‑stack** de E‑commerce desenvolvido com foco em **boas práticas de backend, segurança, organização de código e fundamentos de frontend**, visando **oportunidades de estágio em programação (Frontend / Full‑Stack)**.

Este projeto foi construído como parte dos meus estudos em **Análise e Desenvolvimento de Sistemas**, simulando funcionalidades reais encontradas em sistemas comerciais.

---

## 🎯 Objetivo do Projeto

Demonstrar, na prática:

* Criação de uma aplicação web completa (do banco ao frontend)
* Autenticação e autorização de usuários
* Controle de acesso por perfil (RBAC)
* Manipulação de arquivos
* Integração entre backend, banco de dados e interface

---

## 🚀 Funcionalidades Implementadas

### 🔐 Autenticação & Segurança

* Registro e login de usuários
* Senhas criptografadas com **Bcryptjs**
* Autenticação baseada em **JWT**
* Sessões armazenadas em **Cookies HTTP‑only**
* Proteção de rotas por middleware

### 👥 Controle de Acesso (RBAC)

* **Cliente**: visualiza produtos
* **Vendedor (Seller)**: gerencia produtos
* Middleware de permissão por tipo de usuário

### 📦 Gerenciamento de Produtos

* CRUD completo de produtos
* Upload e troca de imagens dos produtos
* Armazenamento local das imagens
* Persistência do caminho da imagem no banco

### 🔍 Busca Dinâmica

* Barra de pesquisa funcional no catálogo
* Filtros utilizando **ILIKE** no PostgreSQL
* Busca em tempo real por nome do produto

### 🧠 Middleware Global de Sessão

* Middleware que injeta automaticamente os dados do usuário logado em todas as views **EJS**
* Elimina repetição de lógica e erros de referência

### 🎨 UI / UX

* Layout responsivo
* Interface minimalista e funcional
* Botões administrativos claros
* Footer compacto e profissional

---

## 🛠️ Tecnologias Utilizadas

### Backend

* **Node.js**
* **Express.js**
* **JWT** (autenticação)
* **Bcryptjs** (hash de senhas)
* **Multer** (upload de arquivos)

### Frontend

* **EJS** (renderização dinâmica)
* **CSS moderno**

### Banco de Dados

* **PostgreSQL**

---

## 📦 Como Rodar o Projeto Localmente

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
```

2. Instale as dependências:

```bash
npm install
```

3. Crie a pasta de uploads:

```bash
public/uploads
```

4. Configure o arquivo `.env`:

```env
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
```

5. Crie as tabelas no PostgreSQL:

* `users`
* `products` (incluindo a coluna `image_url`)

6. Inicie o servidor:

```bash
npm run dev
```

---

## 📌 Aprendizados Demonstrados

* Arquitetura básica MVC
* Criação de APIs com Express
* Segurança em aplicações web
* Autenticação baseada em tokens
* Integração frontend + backend
* Uso de banco de dados relacional
* Manipulação de arquivos no servidor

---

## 🎯 Próximos Passos (Evoluções Planejadas)

* Paginação de produtos
* Validação de formulários no frontend
* Melhorias de acessibilidade
* Deploy em ambiente de produção

---

## 👨‍💻 Autor

Projeto desenvolvido por **DevCardosu**, estudante de **Análise e Desenvolvimento de Sistemas**, com foco em **estágio Frontend / Full‑Stack**.

Se você é recrutador ou desenvolvedor, fique à vontade para entrar em contato ou deixar feedback.
