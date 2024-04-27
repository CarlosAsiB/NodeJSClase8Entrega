const fs = require('fs');
const path = require('path');

class CartManager {
  constructor(filename) {
    this.filePath = path.join(__dirname, filename);
    this.loadCarts();
  }

  loadCarts() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      this.carts = JSON.parse(data).carts || [];
      this.nextId = JSON.parse(data).nextId || 1;
    } catch (error) {
      this.carts = [];
      this.nextId = 1;
    }
  }

  saveCarts() {
    const data = JSON.stringify({ carts: this.carts, nextId: this.nextId }, null, 2);
    fs.writeFileSync(this.filePath, data, 'utf8');
  }

  createCart() {
    const newCart = {
      id: this.nextId++,
      products: []
    };
    this.carts.push(newCart);
    this.saveCarts();
    return newCart;
  }

  deleteCart(cartId) {
    const cartIndex = this.carts.findIndex(cart => cart.id === cartId);
    if (cartIndex === -1) {
      throw new Error('Cart not found');
    }
    this.carts.splice(cartIndex, 1);
    this.saveCarts();
  }

  getCartById(cartId) {
    const cart = this.carts.find(cart => cart.id === cartId);
    if (!cart) {
      throw new Error('Cart not found');
    }
    return cart;
  }

  addProductToCart(cartId, productId, quantity = 1) {
    const cart = this.getCartById(cartId);
    const productIndex = cart.products.findIndex(p => p.id === productId);

    if (productIndex !== -1) {
      cart.products[productIndex].quantity += quantity;
    } else {
      cart.products.push({ id: productId, quantity });
    }

    this.saveCarts();
    return cart;
  }

  removeProductFromCart(cartId, productId) {
    const cart = this.getCartById(cartId);
    const productIndex = cart.products.findIndex(p => p.id === productId);

    if (productIndex === -1) {
      throw new Error('Product not found in cart');
    }

    cart.products.splice(productIndex, 1);
    this.saveCarts();
  }
}

module.exports = CartManager;
