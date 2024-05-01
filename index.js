import express from 'express';
import { createServer } from 'http';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import ProductManager from './ProductManager.js';
import CartManager from './CartManager.js';
import path from 'path';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const productManager = new ProductManager('products.json');
const cartManager = new CartManager('carts.json');

const PORT = 8080;
 

// Configure Handlebars as the view engine
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// Middleware for parsing JSON and serving static files
app.use(express.json());
app.use(express.static('public'));

// Home route that renders the home template with products
app.get('/', (req, res) => {
  res.render('home', { products: productManager.getProducts() });
});

// Real-time products view
app.get('/realtimeproducts', (req, res) => {
  res.render('realTimeProducts', { products: productManager.getProducts() });
});

// Setup Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for new product addition from client and broadcast it
  socket.on('newProduct', (product) => {
    const newProduct = productManager.addProduct(product);
    io.emit('productAdded', newProduct); // Broadcast new product to all clients
  });

  // Listen for delete product request and broadcast the update
  socket.on('deleteProduct', (productId) => {
    productManager.deleteProduct(productId);
    io.emit('productUpdated', productManager.getProducts()); // Broadcast update to all clients
  });
});

// API Routes for Products
app.post('/api/products', (req, res) => {
  const product = productManager.addProduct(req.body);
  io.emit('productAdded', product); // Emit new product to all clients
  res.status(201).json(product);
});

app.delete('/api/products/:id', (req, res) => {
  productManager.deleteProduct(parseInt(req.params.id));
  io.emit('productUpdated', productManager.getProducts()); // Emit update to all clients
  res.status(204).end();
});

// Start the server
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
