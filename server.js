require('dotenv').config();
const express = require('express');
const pool = require('./db/db'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { verificarToken, verificarRole } = require('./middlewares/auth'); 

const app = express();

// --- 1. CONFIGURAÇÕES E MIDDLEWARES ---
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser()); // Necessário para ler o token dos cookies
app.use(express.static('public'));
app.set('view engine', 'ejs');

// --- 2. ROTAS DE NAVEGAÇÃO (GET) ---

// Rota principal: Busca produtos e identifica se há usuário logado
app.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products');
        
        // Verifica se existe um usuário logado para passar ao index.ejs
        let user = null;
        const token = req.cookies.token;

        if (token) {
            try {
                // Decodifica o token para pegar ID e Cargo (role)
                user = jwt.verify(token, process.env.JWT_SECRET);
            } catch (err) {
                // Se o token for inválido, user permanece null
            }
        }

        // Passamos 'user' (mesmo que seja null) para evitar o ReferenceError
        res.render('index', { 
            products: result.rows, 
            user: user 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro no servidor');
    }
});

app.get('/register', (req, res) => res.render('register'));
app.get('/login', (req, res) => res.render('login'));

// Rota protegida para ver o formulário de cadastro de produto
app.get('/admin/add-product', verificarToken, verificarRole('seller'), (req, res) => {
    res.render('add-product');
});

// Detalhes do produto
app.get('/product/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).send('Produto não encontrado');
        res.render('product', { product: result.rows[0] });
    } catch (err) {
        res.status(500).send('Erro ao buscar produto');
    }
});

// --- 3. ROTAS DE LÓGICA (POST) ---

// Cadastro de Usuário
app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        await pool.query(
            'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)', 
            [username, hashedPassword, role || 'client']
        );
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao cadastrar usuário');
    }
});

// Login do Usuário
app.post('/login', async (req, res) => { 
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) return res.status(400).send('Usuário não encontrado!');
        
        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) return res.status(400).send('Senha incorreta!');

        // Geração do token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Salva nos cookies do navegador
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/');
        
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro no servidor');
    }
});

// Salvar Novo Produto (Apenas Vendedores)
app.post('/products', verificarToken, verificarRole('seller'), async (req, res) => {
    const { name, price, description, stock } = req.body;
    try {
        await pool.query(
            'INSERT INTO products (name, price, description, stock) VALUES ($1, $2, $3, $4)',
            [name, price, description, stock]
        );
        res.redirect('/');
    } catch (err) {
        res.status(500).send('Erro ao salvar produto');
    }
});

// Excluir Produto (Apenas Vendedores)
app.post('/products/delete/:id', verificarToken, verificarRole('seller'), async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM products WHERE id = $1', [id]);
        res.redirect('/');
    } catch (err) {
        res.status(500).send('Erro ao excluir produto');
    }
});

// Logout: Limpa o cookie e redireciona
app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

// 1. Rota para mostrar o formulário de edição com os dados atuais
app.get('/admin/edit-product/:id', verificarToken, verificarRole('seller'), async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).send('Produto não encontrado');

        // Passamos o produto encontrado e o usuário logado para o EJS
        res.render('edit-product', { 
            product: result.rows[0],
            user: req.user 
        });
    } catch (err) {
        res.status(500).send('Erro ao carregar dados do produto');
    }
});

// 2. Rota para processar a atualização dos dados
app.post('/products/update/:id', verificarToken, verificarRole('seller'), async (req, res) => {
    const { id } = req.params;
    const { name, price, description, stock } = req.body;
    try {
        await pool.query(
            'UPDATE products SET name = $1, price = $2, description = $3, stock = $4 WHERE id = $5',
            [name, price, description, stock, id]
        );
        res.redirect('/'); // Redireciona para o catálogo atualizado
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao atualizar produto');
    }
});

// --- 4. INICIALIZAÇÃO ---

pool.on('error', (err) => {
    console.error('Erro inesperado no banco de dados', err);
    process.exit(-1);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));