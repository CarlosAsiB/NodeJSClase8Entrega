import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';

const router = Router();
const productManager = new ProductManager('products.json');

// Rutas API para Productos
router.post('/', (req, res) => {
  try {
    const product = productManager.addProduct(req.body);
    req.app.get('io').emit('productAdded', product);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const updatedProduct = productManager.updateProduct(parseInt(req.params.id), req.body);
    req.app.get('io').emit('productUpdated', productManager.getProducts());
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(404).json({ error: 'Product not found' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    if (!productManager.deleteProduct(parseInt(req.params.id))) {
      throw new Error('Product not found');
    }
    const allProducts = productManager.getProducts();
    req.app.get('io').emit('productUpdated', allProducts);
    res.status(204).end();
  } catch (error) {
    req.app.get('io').emit('deleteError', { error: error.message, id: req.params.id });
    res.status(404).json({ error: error.message });
  }
});

export default router;
