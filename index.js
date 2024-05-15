import express from 'express';
import { createServer } from 'http';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import ProductManager from './managers/ProductManager.js';
import CartManager from './managers/CartManager.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const productManager = new ProductManager('products.json');
const cartManager = new CartManager('carts.json');

const PORT = 8080;

// Configurar Handlebars como el motor de vistas
app.engine('handlebars', engine({
  defaultLayout: 'main',  
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

// Middleware para analizar JSON y servir archivos estáticos
app.use(express.json());
app.use(express.static('public'));

// Ruta principal que renderiza la plantilla home con productos
app.get('/', (req, res) => {
  res.render('home', { products: productManager.getProducts() });
});

// Vista de productos en tiempo real
app.get('/realtimeproducts', (req, res) => {
  res.render('realTimeProducts', { products: productManager.getProducts() });
});

// Configurar la conexión de Socket.io
io.on('connection', (socket) => {
  console.log('Un usuario conectado:', socket.id);

  socket.on('newProduct', (product) => {
    const newProduct = productManager.addProduct(product);
    io.emit('productAdded', newProduct);  // Transmitir el nuevo producto a todos los clientes
  });

  socket.on('deleteProduct', (productId) => {
    productManager.deleteProduct(productId);
    io.emit('productUpdated', productManager.getProducts());  // Transmitir actualización a todos los clientes
  });
});

// Rutas API para Productos
app.post('/api/products', (req, res) => {
  try {
    const product = productManager.addProduct(req.body);
    io.emit('productAdded', product);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', (req, res) => {
  try {
    const updatedProduct = productManager.updateProduct(parseInt(req.params.id), req.body);
    io.emit('productUpdated', productManager.getProducts());
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    if (!productManager.deleteProduct(parseInt(req.params.id))) { 
      throw new Error('Product not found');
    }
    const allProducts = productManager.getProducts();
    io.emit('productUpdated', allProducts);
    res.status(204).end();
  } catch (error) {
    io.emit('deleteError', { error: error.message, id: req.params.id });
    res.status(404).json({ error: error.message });
  }
});



// Rutas API para Carritos
app.get('/api/carts', (req, res) => {
  try {
    const carts = cartManager.getCarts(); 
    res.status(200).json(carts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch carts' });
  }
});

app.post('/api/carts', (req, res) => {
  try {
    const newCart = cartManager.createCart();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create cart' });
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

// Iniciar el servidor
httpServer.listen(PORT, () => {
  console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});
