// Importing modules
import express from 'express';
import { Server } from 'http';
import { engine } from 'express-handlebars';
import socketIo from 'socket.io';
import ProductManager from './ProductManager.js';
import CartManager from './CartManager.js';

// Instantiating the app and other components
const app = express();
const server = new Server(app);
const io = socketIo(server);
const productManager = new ProductManager('products.json');
const cartManager = new CartManager('carts.json');

// Setting port number
const PORT = 8080;

// Setting up Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// Middleware to parse JSON and serve static files
app.use(express.json());
app.use(express.static('public'));

// Home route
app.get('/', (req, res) => {
  res.render('home', { products: productManager.getProducts() });
});

// Real-time products view
app.get('/realtimeproducts', (req, res) => {
  res.render('realTimeProducts', { products: productManager.getProducts() });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('newProduct', (product) => {
    productManager.addProduct(product);
    io.emit('productAdded', productManager.getProducts());
  });

  socket.on('deleteProduct', (productId) => {
    productManager.deleteProduct(productId);
    io.emit('productUpdated', productManager.getProducts());
  });
});

// API Routes for Products
app.post('/api/products', (req, res) => {
  const product = productManager.addProduct(req.body);
  io.emit('productAdded', product); // Emit to update all clients
  res.status(201).json(product);
});

app.delete('/api/products/:id', (req, res) => {
  productManager.deleteProduct(parseInt(req.params.id));
  io.emit('productUpdated', productManager.getProducts()); // Emit to update all clients
  res.status(204).send();
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
