import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Construct __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ProductManager {
  constructor(filename) {
    this.filePath = path.join(__dirname, filename);
    this.loadProducts();
  }

  loadProducts() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      const parsedData = JSON.parse(data);
      this.products = parsedData.products || [];
      this.nextId = parsedData.nextId || 1;
    } catch (error) {
      console.error('Failed to load products:', error);
      this.products = [];
      this.nextId = 1;
    }
  }

  saveProducts() {
    const data = JSON.stringify({ products: this.products, nextId: this.nextId }, null, 2);
    fs.writeFileSync(this.filePath, data, 'utf8');
  }

  getProducts() {
    return this.products;
  }

  addProduct({ title, description, code, price, stock, category }) {
    const product = {
      id: this.nextId++,
      title,
      description,
      code,
      price,
      stock,
      category,
      thumbnails: [],
      status: true  // default status is true
    };
    this.products.push(product);
    this.saveProducts();
    return product;
  }

  updateProduct(id, productData) {
    const productIndex = this.products.findIndex(p => p.id === id);
    if (productIndex === -1) throw new Error('Product not found');
    const updatedProduct = { ...this.products[productIndex], ...productData };
    this.products[productIndex] = updatedProduct;
    this.saveProducts();
    return updatedProduct;
  }

  deleteProduct(id) {
    const productIndex = this.products.findIndex(p => p.id === id);
    if (productIndex === -1) throw new Error('Product not found');
    this.products.splice(productIndex, 1);
    this.saveProducts();
  }
}

export default ProductManager;
