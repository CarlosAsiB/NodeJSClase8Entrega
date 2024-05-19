import express from 'express';
import { createServer } from 'http';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import productsRouter from './routes/products.js';
import cartsRouter from './routes/carts.js';
import ProductManager from './managers/ProductManager.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
app.set('io', io); // Para acceder al io en los controladores de ruta

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

// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Ruta principal que renderiza la plantilla home con productos
app.get('/', (req, res) => {
  const productManager = new ProductManager('products.json');
  res.render('home', { products: productManager.getProducts() });
});

// Vista de productos en tiempo real
app.get('/realtimeproducts', (req, res) => {
  const productManager = new ProductManager('products.json');
  res.render('realTimeProducts', { products: productManager.getProducts() });
});

// Configurar la conexión de Socket.io
io.on('connection', (socket) => {
  console.log('Un usuario conectado:', socket.id);

  socket.on('newProduct', (product) => {
    const productManager = new ProductManager('products.json');
    const newProduct = productManager.addProduct(product);
    io.emit('productAdded', newProduct);
  });

  socket.on('deleteProduct', (productId) => {
    const productManager = new ProductManager('products.json');
    productManager.deleteProduct(productId);
    io.emit('productUpdated', productManager.getProducts());
  });
});

// Iniciar el servidor
httpServer.listen(PORT, () => {
  console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});
