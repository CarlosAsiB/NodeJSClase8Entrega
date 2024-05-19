import { Router } from 'express';
import CartManager from '../managers/CartManager.js';

const router = Router();
const cartManager = new CartManager('carts.json');

// Rutas API para Carritos
router.get('/', (req, res) => {
  try {
    const carts = cartManager.getCarts();
    res.status(200).json(carts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch carts' });
  }
});

router.post('/', (req, res) => {
  try {
    const newCart = cartManager.createCart();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create cart' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    cartManager.deleteCart(parseInt(req.params.id));
    res.status(204).end();
  } catch (error) {
    res.status(404).json({ error: 'Cart not found' });
  }
});

// Ruta para listar productos de un carrito
router.get('/:cid', (req, res) => {
  try {
    const cart = cartManager.getCartById(parseInt(req.params.cid));
    res.status(200).json(cart.products);
  } catch (error) {
    res.status(404).json({ error: 'Cart not found' });
  }
});

export default router;
