🛒 TechShop MVP - E-commerce Full-Stack
Este é um projeto de E-commerce funcional desenvolvido como parte dos meus estudos em Análise e Desenvolvimento de Sistemas. O foco principal foi a criação de um sistema robusto de gerenciamento de produtos com autenticação segura, upload de arquivos e experiência de usuário otimizada.

🚀 Novas Funcionalidades & Ajustes Recentes
🖼️ Gerenciamento de Imagens: Implementação de upload de fotos reais dos produtos utilizando a biblioteca Multer, com armazenamento local e persistência do caminho no banco de dados.

🔍 Busca Dinâmica: Barra de pesquisa funcional no catálogo que utiliza filtros ILIKE no PostgreSQL para encontrar produtos por nome em tempo real.

🛡️ Middleware Global de Sessão: Otimização do backend para disponibilizar os dados do usuário logado (via JWT) para todos os templates EJS automaticamente, eliminando erros de referência.

🎨 UI/UX Minimalista: Layout responsivo com CSS Moderno, incluindo um rodapé (footer) compacto e profissional, além de botões administrativos intuitivos.

🛠️ Funcionalidades Principais
Autenticação Completa: Login e Registro com senhas criptografadas via Bcryptjs.

Controle de Acesso (RBAC): Diferenciação de permissões entre Cliente e Vendedor (Seller).

CRUD de Produtos: Vendedores possuem painel exclusivo para criar, editar (incluindo troca de imagem) e excluir itens.

Segurança: Proteção de rotas via JWT (JSON Web Tokens) e armazenamento seguro através de Cookies HTTP-only.

Persistência: Banco de dados relacional PostgreSQL.

💻 Tecnologias Utilizadas
Node.js & Express (Ambiente e Framework)

PostgreSQL (Banco de Dados)

EJS (View Engine para renderização dinâmica)

Multer (Processamento de uploads de arquivos)

JWT & Cookie-parser (Gestão de autenticação e sessão)

Bcryptjs (Segurança e hashing de credenciais)

📦 Como rodar o projeto
Clone o repositório.

Execute npm install.

Importante: Crie a pasta public/uploads na raiz do projeto.

Configure o arquivo .env com suas credenciais do banco e JWT_SECRET.

Execute as queries SQL para criar as tabelas users e products (certifique-se de incluir a coluna image_url na tabela de produtos).

Inicie o servidor com npm run dev.
