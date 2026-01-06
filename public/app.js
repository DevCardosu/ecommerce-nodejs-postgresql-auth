// Exemplo simples: armazenar carrinho no localStorage
function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Produto adicionado ao carrinho!');
}