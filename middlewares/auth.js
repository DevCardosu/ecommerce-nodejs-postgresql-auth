// middlewares/auth.js
const jwt = require('jsonwebtoken');

// Verifica se o usuário está logado
const verificarToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.redirect('/login');

    try {
        const verificado = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verificado; 
        next();
    } catch (err) {
        res.clearCookie('token');
        res.redirect('/login');
    }
};

// Verifica se o usuário tem o cargo necessário
const verificarRole = (roleNecessario) => {
    return (req, res, next) => {
        if (req.user.role !== roleNecessario) {
            return res.status(403).send('Acesso negado: Esta área é exclusiva para vendedores.');
        }
        next();
    };
};

module.exports = { verificarToken, verificarRole };