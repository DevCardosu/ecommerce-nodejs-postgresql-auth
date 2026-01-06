CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    stock INT DEFAULT 0
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'seller'  -- Para vendedores
);

INSERT INTO products (name, price, description, stock) VALUES
('Produto Exemplo 1', 29.99, 'Descrição aqui', 10),
('Produto Exemplo 2', 49.99, 'Outra descrição', 5);