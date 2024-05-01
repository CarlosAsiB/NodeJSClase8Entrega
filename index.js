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
 

// Configurar Handlebars como el motor de vistas
app.engine('handlebars', engine());
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

  // Escuchar la adición de nuevos productos desde el cliente y transmitirlo
  socket.on('newProduct', (product) => {
    const newProduct = productManager.addProduct(product);
    io.emit('productAdded', newProduct); // Transmitir el nuevo producto a todos los clientes
  });

  // Escuchar la solicitud de eliminación de productos y transmitir la actualización
  socket.on('deleteProduct', (productId) => {
    productManager.deleteProduct(productId);
    io.emit('productUpdated', productManager.getProducts()); // Transmitir actualización a todos los clientes
  });
});

// Rutas API para Productos
app.post('/api/products', (req, res) => {
  const product = productManager.addProduct(req.body);
  io.emit('productAdded', product); // Emitir el nuevo producto a todos los clientes
  res.status(201).json(product);
});

app.delete('/api/products/:id', (req, res) => {
  productManager.deleteProduct(parseInt(req.params.id));
  io.emit('productUpdated', productManager.getProducts()); // Emitir actualización a todos los clientes
  res.status(204).end();
});

// Iniciar el servidor
httpServer.listen(PORT, () => {
  console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});
