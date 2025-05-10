import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { uploadToS3 } from '../utils/s3';

const router = Router();
const prisma = new PrismaClient();

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
      },
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product
router.post('/', async (req, res) => {
  try {
    const { name, description, price, categoryId, image } = req.body;
    
    // Upload image to S3 if provided
    let imageUrl = null;
    if (image) {
      imageUrl = await uploadToS3(image, 'products');
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId,
        imageUrl,
      },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { name, description, price, categoryId, image } = req.body;
    
    // Upload new image to S3 if provided
    let imageUrl = undefined;
    if (image) {
      imageUrl = await uploadToS3(image, 'products');
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId,
        ...(imageUrl && { imageUrl }),
      },
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router; 