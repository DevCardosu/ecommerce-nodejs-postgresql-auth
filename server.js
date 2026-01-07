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
app.use(cookieParser()); 
app.use(express.static('public'));
app.set('view engine', 'ejs');

// MIDDLEWARE GLOBAL: Disponibiliza 'user' para TODOS os templates EJS automaticamente
app.use((req, res, next) => {
    const token = req.cookies.token;
    res.locals.user = null; // Valor padrão se não estiver logado

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            res.locals.user = decoded; // Agora 'user' existe em qualquer .render()
        } catch (err) {
            // Se o token for inválido, o user continua null
        }
    }
    next();
});

// --- 2. ROTAS DE NAVEGAÇÃO (GET) ---

// Catálogo Principal
app.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products');
        // Não precisa mais passar 'user: user' manualmente!
        res.render('index', { products: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro no servidor');
    }
});

app.get('/register', (req, res) => res.render('register'));
app.get('/login', (req, res) => res.render('login'));

// Detalhes de um Produto Específico
app.get('/product/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).send('Produto não encontrado');
        }

        res.render('product', { product: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao carregar detalhes do produto');
    }
});

// Rota para ver o formulário de cadastro (Apenas Vendedores)
app.get('/admin/add-product', verificarToken, verificarRole('seller'), (req, res) => {
    res.render('add-product');
});

// Rota para formulário de edição (Apenas Vendedores)
app.get('/admin/edit-product/:id', verificarToken, verificarRole('seller'), async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).send('Produto não encontrado');

        res.render('edit-product', { product: result.rows[0] });
    } catch (err) {
        res.status(500).send('Erro ao carregar dados do produto');
    }
});

// --- 3. ROTAS DE LÓGICA (POST) ---

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

app.post('/login', async (req, res) => { 
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) return res.status(400).send('Usuário não encontrado!');
        
        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) return res.status(400).send('Senha incorreta!');

        const token = jwt.sign(
            { id: user.id, role: user.role, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, { httpOnly: true });
        res.redirect('/');
        
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro no servidor');
    }
});

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

app.post('/products/update/:id', verificarToken, verificarRole('seller'), async (req, res) => {
    const { id } = req.params;
    const { name, price, description, stock } = req.body;
    try {
        await pool.query(
            'UPDATE products SET name = $1, price = $2, description = $3, stock = $4 WHERE id = $5',
            [name, price, description, stock, id]
        );
        res.redirect(`/product/${id}`); // Redireciona para a página do produto editado
    } catch (err) {
        res.status(500).send('Erro ao atualizar produto');
    }
});

app.post('/products/delete/:id', verificarToken, verificarRole('seller'), async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM products WHERE id = $1', [id]);
        res.redirect('/');
    } catch (err) {
        res.status(500).send('Erro ao excluir produto');
    }
});

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

// --- 4. INICIALIZAÇÃO ---
pool.on('error', (err) => {
    console.error('Erro inesperado no banco de dados', err);
    process.exit(-1);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));