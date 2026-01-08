require('dotenv').config();
const express = require('express');
const pool = require('./db/db'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const { verificarToken, verificarRole } = require('./middlewares/auth'); 

const app = express();

// --- 1. CONFIGURAÇÃO DO MULTER (UPLOAD DE IMAGENS) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); // Certifique-se de que esta pasta existe
    },
    filename: (req, file, cb) => {
        // Gera um nome único: timestamp + extensão original
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Limite de 2MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Apenas imagens são permitidas!"));
    }
});

// --- 2. MIDDLEWARES ---
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser()); 
app.use(express.static('public')); // Serve a pasta public (onde ficam as imagens)
app.set('view engine', 'ejs');

// MIDDLEWARE GLOBAL: Disponibiliza 'user' para todos os templates EJS automaticamente
app.use((req, res, next) => {
    const token = req.cookies.token;
    res.locals.user = null; 

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            res.locals.user = decoded;
        } catch (err) {
            // Token inválido ou expirado
        }
    }
    next();
});

// --- 3. ROTAS DE NAVEGAÇÃO (GET) ---

app.get('/', async (req, res) => {
    const searchTerm = req.query.search; // Captura o que vem de ?search=...
    
    try {
        let result;
        if (searchTerm) {
            // Busca produtos que CONTÉM o termo no nome (usando % para busca parcial)
            result = await pool.query(
                'SELECT * FROM products WHERE name ILIKE $1 ORDER BY id DESC', 
                [`%${searchTerm}%`]
            );
        } else {
            // Se não houver busca, mostra tudo normalmente
            result = await pool.query('SELECT * FROM products ORDER BY id DESC');
        }

        res.render('index', { 
            products: result.rows, 
            searchTerm: searchTerm || '' // Enviamos o termo de volta para manter no input
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao buscar produtos');
    }
});

app.get('/register', (req, res) => res.render('register'));
app.get('/login', (req, res) => res.render('login'));

app.get('/product/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).send('Produto não encontrado');
        res.render('product', { product: result.rows[0] });
    } catch (err) {
        res.status(500).send('Erro ao carregar detalhes');
    }
});

app.get('/admin/add-product', verificarToken, verificarRole('seller'), (req, res) => {
    res.render('add-product');
});

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

// --- 4. ROTAS DE LÓGICA (POST) ---

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
        res.status(500).send('Erro no servidor');
    }
});

// SALVAR NOVO PRODUTO COM IMAGEM
app.post('/products', verificarToken, verificarRole('seller'), upload.single('image'), async (req, res) => {
    const { name, price, description, stock } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        await pool.query(
            'INSERT INTO products (name, price, description, stock, image_url) VALUES ($1, $2, $3, $4, $5)',
            [name, price, description, stock, image_url]
        );
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao salvar produto');
    }
});

app.post('/products/update/:id', verificarToken, verificarRole('seller'), upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { name, price, description, stock } = req.body;
    
    try {
        // 1. Verificar se uma nova imagem foi enviada
        if (req.file) {
            const image_url = `/uploads/${req.file.filename}`;
            await pool.query(
                'UPDATE products SET name = $1, price = $2, description = $3, stock = $4, image_url = $5 WHERE id = $6',
                [name, price, description, stock, image_url, id]
            );
        } else {
            // 2. Se não enviou imagem nova, mantém a que já estava (não mexe na image_url)
            await pool.query(
                'UPDATE products SET name = $1, price = $2, description = $3, stock = $4 WHERE id = $5',
                [name, price, description, stock, id]
            );
        }
        
        res.redirect(`/product/${id}`);
    } catch (err) {
        console.error(err);
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

// --- 5. INICIALIZAÇÃO ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));