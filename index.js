import express from 'express';
import ProductManager from './ProductManager';
import CartManager from './CartManager';

const app = express();
const PORT = 8080;

app.use(express.json());

const productManager = new ProductManager('products.json');
const cartManager = new CartManager('carts.json');

app.get('/', (req, res) => {
  res.send('Bienvenido a la API de gestión de productos de café.');
});

app.get('/api/products', (req, res) => {
  const products = productManager.getProducts();
  const limit = parseInt(req.query.limit, 10);
  if (!isNaN(limit) && limit > 0) {
    res.json(products.slice(0, limit));
  } else {
    res.json(products);
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const product = productManager.getProductsById(parseInt(req.params.id));
    res.json(product);
  } catch (error) {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.post('/api/products', (req, res) => {
  try {
    const product = productManager.addProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error adding product' });
  }
});

app.put('/api/products/:id', (req, res) => {
  try {
    const product = productManager.updateProduct(parseInt(req.params.id), req.body);
    res.json(product);
  } catch (error) {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    productManager.deleteProduct(parseInt(req.params.id));
    res.status(204).end();
  } catch (error) {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.post('/api/carts', (req, res) => {
  try {
    const cart = cartManager.createCart();
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Error creating cart' });
  }
});

app.delete('/api/carts/:id', (req, res) => {
  try {
    cartManager.deleteCart(parseInt(req.params.id));
    res.status(204).end();
  } catch (error) {
    res.status(404).json({ error: 'Cart not found' });
  }
});

app.get('/api/carts/:id', (req, res) => {
  try {
    const cart = cartManager.getCartById(parseInt(req.params.id));
    res.json(cart);
  } catch (error) {
    res.status(404).json({ error: 'Cart not found' });
  }
});

app.post('/api/carts/:id/products/:productId', (req, res) => {
  try {
    const cart = cartManager.addProductToCart(parseInt(req.params.id), parseInt(req.params.productId));
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Error adding product to cart' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
