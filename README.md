# 🛒 TechShop MVP - E-commerce Backend

Este é um projeto de E-commerce funcional desenvolvido como parte dos meus estudos em **Desenvolvimento de Sistemas**. O foco principal foi a criação de um sistema robusto de gerenciamento de produtos com autenticação segura.

## 🚀 Funcionalidades
- **Autenticação Completa**: Login e Registro de usuários com senhas criptografadas (Bcrypt).
- **Controle de Acesso (RBAC)**: Diferenciação entre Cliente e Vendedor (Seller).
- **CRUD de Produtos**: Vendedores podem criar, visualizar, editar e excluir produtos.
- **Segurança**: Proteção de rotas via JWT (JSON Web Tokens) e armazenamento via Cookies.
- **Persistência**: Banco de dados relacional PostgreSQL.

## 🛠️ Tecnologias Utilizadas
- **Node.js** & **Express**
- **PostgreSQL** (Banco de Dados)
- **EJS** (View Engine)
- **JWT** (Autenticação)
- **Bcryptjs** (Segurança de Senhas)
- **Cookie-parser** (Gestão de Sessão)

## 📦 Como rodar o projeto
1. Clone o repositório.
2. Execute `npm install`.
3. Configure o arquivo `.env` baseado no `.env.example`.
4. Inicie com `npm run dev`.
